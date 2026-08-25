'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CheckoutSelection, PartyEvent, TicketGender, TicketType } from '@/lib/party/types';
import { formatBu, formatBuWithNaira } from '@/lib/party/bison';
import { availabilityFromRemaining, availabilityLabel, formatNaira } from '@/lib/party/format';
import { genderLabel, lineTotalKobo, unitPriceKobo } from '@/lib/party/pricing';
import { useLiveEvent } from '@/lib/party/use-live-event';

function QtyControl({
  value,
  onChange,
  max,
  disabled,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="xp-icon-btn rounded-full border border-white/20 text-lg"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="w-8 text-center text-lg tabular-nums">{value}</span>
      <button
        type="button"
        className="xp-icon-btn rounded-full border border-white/20 text-lg"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

function TicketCard({
  ticket,
  guys,
  girls,
  onGuys,
  onGirls,
  now,
}: {
  ticket: TicketType;
  guys: number;
  girls: number;
  onGuys: (n: number) => void;
  onGirls: (n: number) => void;
  now: number | null;
}) {
  const status = availabilityFromRemaining(ticket.remaining, ticket.capacity);
  const soldOut = status === 'sold_out';
  const notOnSale =
    now !== null &&
    (now < new Date(ticket.saleStartsAt).getTime() || now > new Date(ticket.saleEndsAt).getTime());
  const disabled = soldOut || notOnSale;
  const girlUnit = unitPriceKobo(ticket.pricing, 'female', Math.max(girls, 1));
  const girlLive = unitPriceKobo(ticket.pricing, 'female', girls);
  const remainingAfter = Math.min(ticket.maxPerCustomer, ticket.remaining);

  return (
    <article className="xp-ticket xp-glass p-5 md:p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="xp-display text-2xl md:text-3xl">{ticket.name}</h3>
        <span className="text-[10px] md:text-xs tracking-[0.16em] uppercase text-[var(--xp-gold)] shrink-0 pt-1">
          {availabilityLabel(status)}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/65">{ticket.description}</p>
      <ul className="mt-4 space-y-1 text-sm text-white/70">
        {ticket.benefits.map((b) => (
          <li key={b}>— {b}</li>
        ))}
      </ul>

      <div className="mt-5 space-y-3 relative z-[2]">
        <div className="rounded-2xl border border-white/10 p-3">
          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.16em] uppercase text-white/45">Guys</p>
              <p className="xp-display text-xl mt-1">{formatBu(ticket.pricing.maleKobo)}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{formatNaira(ticket.pricing.maleKobo)}</p>
            </div>
            <QtyControl value={guys} onChange={onGuys} max={remainingAfter} disabled={disabled} label={`${ticket.name} guys`} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 p-3">
          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.16em] uppercase text-white/45">Girls</p>
              <p className="xp-display text-xl mt-1">{formatBu(girls > 1 ? girlLive : girlUnit)}</p>
              <p className="text-[11px] text-white/40 mt-1 leading-snug">
                {formatBuWithNaira(ticket.pricing.femaleKobo)} each · Ladies Duo {formatBuWithNaira(ticket.pricing.femaleMultiKobo * 2)} for 2
              </p>
            </div>
            <QtyControl value={girls} onChange={onGirls} max={remainingAfter} disabled={disabled} label={`${ticket.name} girls`} />
          </div>
          {girls > 1 && (
            <p className="mt-2 text-xs text-[var(--xp-gold)]">Girl group rate on — {formatBuWithNaira(ticket.pricing.femaleMultiKobo)} each</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-white/40">{ticket.remaining} remaining · max {ticket.maxPerCustomer} per gender</p>
    </article>
  );
}

export function PartyTicketGrid({ event: initial, checkout }: { event: PartyEvent; checkout?: boolean }) {
  const event = useLiveEvent(initial);
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, { male: number; female: number }>>({});
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

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
      return {
        ...prev,
        [id]: gender === 'male' ? { ...current, male: n } : { ...current, female: n },
      };
    });
  }

  function goCheckout() {
    sessionStorage.setItem('xoral-party-selection', JSON.stringify(selected));
    router.push('/party/checkout');
  }

  return (
    <section className="xp-section" id="tickets">
      <div className="xp-wrap">
        <p className="xp-kicker">07 — Tickets for 30 September</p>
        <h2 className="xp-display mt-3 text-[2rem] sm:text-4xl md:text-6xl">CHOOSE HOW YOU ENTER.</h2>
        <p className="mt-3 text-sm text-white/55">Priced in Bison Notes (ɃU). You pay in naira. Guys and girls have different rates — two or more girl tickets drop to the group girl price.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {event.ticketTypes.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              guys={qty[ticket.id]?.male ?? 0}
              girls={qty[ticket.id]?.female ?? 0}
              onGuys={(n) => setGenderQty(ticket.id, 'male', n)}
              onGirls={(n) => setGenderQty(ticket.id, 'female', n)}
              now={now}
            />
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-6 md:mt-8 xp-glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-[calc(var(--xp-sticky-h)+0.5rem)] z-30">
            <div>
              <p className="xp-display text-xl">{formatBu(total)}</p>
              <p className="text-xs text-white/45">{formatNaira(total)}</p>
              <p className="text-xs text-white/45 mt-1">
                {selected.map((s) => {
                  const t = event.ticketTypes.find((x) => x.id === s.ticketTypeId);
                  return `${s.quantity}× ${t?.name ?? ''} ${genderLabel(s.gender)}`;
                }).join(' · ')}
              </p>
            </div>
            <button type="button" className="xp-btn xp-btn-primary" onClick={goCheckout}>
              Continue to checkout
            </button>
          </div>
        )}
        {!checkout && selected.length === 0 && (
          <p className="mt-6 text-sm text-white/40">Pick guys or girls on a ticket to continue.</p>
        )}
      </div>
    </section>
  );
}
