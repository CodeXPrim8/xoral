'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import { formatBu, formatBuWithNaira } from '@/lib/party/bison';
import { formatNaira } from '@/lib/party/format';
import { genderLabel, lineTotalKobo, unitPriceKobo } from '@/lib/party/pricing';
import { readTickets, saveTicketsLocal, type StoredTicket } from '@/lib/party/client-store';
import { useLiveEvent } from '@/lib/party/use-live-event';
import type { CheckoutSelection, TicketGender, TicketType } from '@/lib/party/types';

type View = 'shop' | 'checkout' | 'wallet' | 'pass';

function Qty({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
}) {
  return (
    <div className="cx-tix-qty">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label="Decrease">−</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase">+</button>
    </div>
  );
}

export function TicketsApp() {
  const event = useLiveEvent(MOCK_EVENT);
  const [view, setView] = useState<View>('shop');
  const [qty, setQty] = useState<Record<string, { male: number; female: number }>>({});
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [pass, setPass] = useState<StoredTicket | null>(null);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTickets(readTickets());
  }, [view]);

  useEffect(() => {
    if (!pass) {
      setQr('');
      return;
    }
    void QRCode.toDataURL(pass.qrPayload, { margin: 1, width: 280, color: { dark: '#14010c', light: '#f7f1ea' } }).then(setQr);
  }, [pass]);

  const selected = useMemo(() => {
    const items: CheckoutSelection[] = [];
    for (const ticket of event.ticketTypes) {
      const row = qty[ticket.id] ?? { male: 0, female: 0 };
      if (row.male > 0) items.push({ ticketTypeId: ticket.id, quantity: row.male, gender: 'male' });
      if (row.female > 0) items.push({ ticketTypeId: ticket.id, quantity: row.female, gender: 'female' });
    }
    return items;
  }, [event.ticketTypes, qty]);

  const total = selected.reduce((sum, s) => {
    const t = event.ticketTypes.find((x) => x.id === s.ticketTypeId);
    return sum + (t ? lineTotalKobo(t, s.gender, s.quantity) : 0);
  }, 0);

  function setGenderQty(id: string, gender: TicketGender, n: number) {
    setQty((prev) => {
      const current = prev[id] ?? { male: 0, female: 0 };
      return { ...prev, [id]: gender === 'male' ? { ...current, male: n } : { ...current, female: n } };
    });
  }

  async function onCheckout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (selected.length === 0) {
      setError('Pick a ticket first.');
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/party/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: event.id,
        items: selected,
        fullName: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        referralCode: typeof window !== 'undefined' ? sessionStorage.getItem('xoral-party-ref') || undefined : undefined,
      }),
    });
    const json = (await res.json()) as {
      error?: string;
      authorizationUrl?: string;
      orderId?: string;
      reference?: string;
      provider?: string;
    };
    if (!res.ok || !json.authorizationUrl) {
      setLoading(false);
      setError(json.error || 'Could not start payment.');
      return;
    }

    const localPay = json.provider === 'mock' || json.authorizationUrl.startsWith('/');
    if (!localPay) {
      window.location.href = json.authorizationUrl;
      return;
    }

    const payUrl = new URL(json.authorizationUrl, window.location.origin);
    const reference = payUrl.searchParams.get('reference') || json.reference || '';
    const order = payUrl.searchParams.get('order') || json.orderId || '';
    const verify = await fetch(`/api/party/checkout/verify?reference=${encodeURIComponent(reference)}&order=${encodeURIComponent(order)}`);
    const paid = await verify.json();
    setLoading(false);
    if (!verify.ok) {
      setError(paid.error || 'Payment could not be verified.');
      return;
    }
    const stored: StoredTicket[] = paid.tickets.map((t: StoredTicket) => ({
      ...t,
      eventName: `${paid.event.name} ${paid.event.volume}`,
      eventDate: paid.event.startsAt,
      venue: paid.event.venue,
      orderNumber: paid.order.id,
    }));
    saveTicketsLocal(stored);
    setTickets(readTickets());
    setQty({});
    setView('wallet');
  }

  if (view === 'pass' && pass) {
    return (
      <div className="cx-ios-app cx-tix">
        <button type="button" className="cx-tix-back" onClick={() => setView('wallet')}>Wallet</button>
        <article className="cx-bison">
          <p>Bison Note</p>
          <h4>{pass.eventName}</h4>
          <strong>{pass.guestName}</strong>
          <em>{pass.ticketTypeName}</em>
          {qr && <img src={qr} alt="Entry QR" />}
          <span>{pass.id}</span>
        </article>
      </div>
    );
  }

  if (view === 'wallet') {
    return (
      <div className="cx-ios-app cx-tix">
        <div className="cx-tix-top">
          <h3>Wallet</h3>
          <button type="button" onClick={() => setView('shop')}>Buy</button>
        </div>
        <p className="cx-ios-sub">Bison Notes on this phone</p>
        {tickets.length === 0 && <p className="cx-ios-sub">No tickets yet.</p>}
        <div className="cx-tix-list">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              className="cx-tix-pass"
              onClick={() => {
                setPass(t);
                setView('pass');
              }}
            >
              <b>{t.ticketTypeName}</b>
              <span>{t.guestName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'checkout') {
    return (
      <div className="cx-ios-app cx-tix">
        <button type="button" className="cx-tix-back" onClick={() => setView('shop')}>Tickets</button>
        <h3>Checkout</h3>
        <p className="cx-ios-sub">{formatBuWithNaira(total)}</p>
        <ul className="cx-tix-lines">
          {selected.map((s) => {
            const t = event.ticketTypes.find((x) => x.id === s.ticketTypeId);
            if (!t) return null;
            return (
              <li key={`${s.ticketTypeId}-${s.gender}`}>
                {s.quantity}× {t.name} · {genderLabel(s.gender)}
              </li>
            );
          })}
        </ul>
        <form onSubmit={(e) => void onCheckout(e)} className="cx-tix-form">
          <input name="fullName" required placeholder="Full name" autoComplete="name" />
          <input name="email" type="email" required placeholder="Email" autoComplete="email" inputMode="email" />
          <input name="phone" required placeholder="Phone" autoComplete="tel" inputMode="tel" />
          {error && <p className="cx-tix-err">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Paying…' : `Pay ${formatBu(total)}`}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="cx-ios-app cx-tix">
      <div className="cx-tix-top">
        <h3>Tickets</h3>
        <button type="button" onClick={() => setView('wallet')}>Wallet</button>
      </div>
      <p className="cx-ios-sub">VOL. 08 · 30 Sept 2026 · Ambiance, Ikeja. Priced in Bison Notes. Pay in naira on this phone.</p>
      <div className="cx-tix-list">
        {event.ticketTypes.map((ticket) => (
          <TicketRow
            key={ticket.id}
            ticket={ticket}
            guys={qty[ticket.id]?.male ?? 0}
            girls={qty[ticket.id]?.female ?? 0}
            onGuys={(n) => setGenderQty(ticket.id, 'male', n)}
            onGirls={(n) => setGenderQty(ticket.id, 'female', n)}
          />
        ))}
      </div>
      {selected.length > 0 && (
        <button type="button" className="cx-tix-buy" onClick={() => setView('checkout')}>
          Buy {formatBu(total)}
        </button>
      )}
    </div>
  );
}

function TicketRow({
  ticket,
  guys,
  girls,
  onGuys,
  onGirls,
}: {
  ticket: TicketType;
  guys: number;
  girls: number;
  onGuys: (n: number) => void;
  onGirls: (n: number) => void;
}) {
  const girl = unitPriceKobo(ticket.pricing, 'female', Math.max(girls, 1));
  return (
    <article className="cx-tix-card">
      <div className="cx-tix-card-h">
        <h4>{ticket.name}</h4>
        <span>{ticket.remaining} left</span>
      </div>
      <p>{ticket.description}</p>
      <div className="cx-tix-row">
        <div>
          <em>Guys</em>
          <strong>{formatBu(ticket.pricing.maleKobo)}</strong>
          <small>{formatNaira(ticket.pricing.maleKobo)}</small>
        </div>
        <Qty value={guys} onChange={onGuys} max={Math.min(ticket.maxPerCustomer, ticket.remaining)} />
      </div>
      <div className="cx-tix-row">
        <div>
          <em>Girls</em>
          <strong>{formatBu(girl)}</strong>
          <small>{formatNaira(girl)}</small>
        </div>
        <Qty value={girls} onChange={onGirls} max={Math.min(ticket.maxPerCustomer, ticket.remaining)} />
      </div>
    </article>
  );
}
