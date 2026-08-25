'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_EVENT } from '@/lib/party/mock-event';
import type { CheckoutSelection } from '@/lib/party/types';
import { formatBu, formatBuWithNaira } from '@/lib/party/bison';
import { formatNaira } from '@/lib/party/format';
import { genderLabel, lineTotalKobo, unitPriceKobo } from '@/lib/party/pricing';

export default function CheckoutPage() {
  const router = useRouter();
  const [selection, setSelection] = useState<CheckoutSelection[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [refCode, setRefCode] = useState('');
  const [refLocked, setRefLocked] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('xoral-party-selection');
      setSelection(raw ? (JSON.parse(raw) as CheckoutSelection[]) : []);
      const stored = sessionStorage.getItem('xoral-party-ref') || '';
      setRefCode(stored);
      setRefLocked(sessionStorage.getItem('xoral-party-ref-locked') === '1' && Boolean(stored));
    } catch {
      setSelection([]);
    }
  }, []);

  const lines = useMemo(
    () =>
      selection.map((s) => {
        const t = MOCK_EVENT.ticketTypes.find((x) => x.id === s.ticketTypeId);
        if (!t) return null;
        const unit = unitPriceKobo(t.pricing, s.gender, s.quantity);
        return {
          ...s,
          name: t.name,
          unitKobo: unit,
          lineKobo: lineTotalKobo(t, s.gender, s.quantity),
        };
      }).filter(Boolean) as {
        ticketTypeId: string;
        quantity: number;
        gender: CheckoutSelection['gender'];
        name: string;
        unitKobo: number;
        lineKobo: number;
      }[],
    [selection]
  );

  const total = lines.reduce((sum, l) => sum + l.lineKobo, 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (lines.length === 0) {
      setError('Select a ticket first.');
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/party/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: MOCK_EVENT.id,
        items: selection,
        fullName: form.get('fullName'),
        email: form.get('email'),
        phone: form.get('phone'),
        referralCode: refLocked ? refCode : (String(form.get('referralCode') || refCode).trim() || undefined),
        promoCode: form.get('promoCode') || undefined,
        showOnGuestWall: form.get('showOnGuestWall') === 'on',
        instagram: form.get('instagram') || undefined,
      }),
    });
    const json = (await res.json()) as { error?: string; authorizationUrl?: string };
    if (!res.ok || !json.authorizationUrl) {
      setLoading(false);
      setError(json.error || 'Could not start payment.');
      return;
    }
    if (/^https?:\/\//i.test(json.authorizationUrl)) {
      window.location.href = json.authorizationUrl;
      return;
    }
    setLoading(false);
    router.push(json.authorizationUrl);
  }

  return (
    <div className="xp-wrap pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] max-w-xl">
      <p className="xp-kicker">Checkout</p>
      <h1 className="xp-display text-[2rem] sm:text-4xl mt-3">YOUR DETAILS</h1>
      <p className="mt-2 text-sm text-white/50">Guest checkout. No account required.</p>

      <ul className="mt-8 space-y-2 text-sm">
        {lines.map((l) => (
          <li key={`${l.ticketTypeId}-${l.gender}`} className="flex justify-between gap-3">
            <span>{l.quantity}× {l.name} · {genderLabel(l.gender)} · {formatBu(l.unitKobo)} each</span>
            <span>{formatBu(l.lineKobo)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 xp-display text-2xl">{formatBu(total)}</p>
      <p className="text-sm text-white/45 mt-1">{formatNaira(total)} charged in naira</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="fullName" required placeholder="Full name" autoComplete="name" className="xp-field" />
        <input name="email" type="email" required placeholder="Email" autoComplete="email" inputMode="email" className="xp-field" />
        <input name="phone" required placeholder="Phone" autoComplete="tel" inputMode="tel" className="xp-field" />
        <input
          name="referralCode"
          placeholder="Sales code (optional)"
          value={refCode}
          readOnly={refLocked}
          aria-readonly={refLocked}
          onChange={(e) => {
            if (!refLocked) setRefCode(e.target.value);
          }}
          className={`xp-field ${refLocked ? 'cursor-not-allowed opacity-70' : ''}`}
        />
        {refLocked && (
          <p className="-mt-2 text-xs text-white/40">This sale is tied to the seller’s link. The code cannot be changed.</p>
        )}
        <input name="promoCode" placeholder="Promo code (optional)" className="xp-field" />
        <label className="flex items-center gap-3 text-sm text-white/70 min-h-12">
          <input type="checkbox" name="showOnGuestWall" className="h-5 w-5 accent-[#e8c36a]" />
          Show me on the guest wall
        </label>
        <input name="instagram" placeholder="Instagram handle (optional)" autoCapitalize="none" className="xp-field" />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button type="submit" disabled={loading} className="xp-btn xp-btn-primary w-full">
          {loading ? 'Starting Paystack…' : `Pay ${formatBuWithNaira(total)}`}
        </button>
        <p className="text-xs text-white/35">
          Pay with Paystack (card, bank, USSD or transfer). After payment is confirmed, your tickets are emailed to you.
        </p>
      </form>
    </div>
  );
}
