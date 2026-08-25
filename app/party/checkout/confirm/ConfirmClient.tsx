'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { addGuestWall, saveTicketsLocal, type StoredTicket } from '@/lib/party/client-store';
import { AttendShare } from '@/components/party/AttendShare';

export default function CheckoutConfirmPage() {
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<StoredTicket[]>([]);
  const [salesCode, setSalesCode] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const reference = params.get('reference') || params.get('orderNo') || params.get('order');
    const order = params.get('order') || reference;
    if (!order) {
      setError('Missing payment reference.');
      setProcessing(false);
      return;
    }
    const orderRef = order;
    const payRef = reference || order;

    let cancelled = false;
    let attempts = 0;

    async function verifyOnce(): Promise<boolean> {
      const res = await fetch(`/api/party/checkout/verify?reference=${encodeURIComponent(payRef)}&order=${encodeURIComponent(orderRef)}`);
      const json = await res.json();
      if (cancelled) return true;
      if (res.status === 202 || json.processing) {
        return false;
      }
      if (!res.ok) {
        setError(json.error || 'Payment could not be verified.');
        setProcessing(false);
        return true;
      }
      const stored: StoredTicket[] = json.tickets.map((t: StoredTicket) => ({
        ...t,
        eventName: `${json.event.name} ${json.event.volume}`,
        eventDate: json.event.startsAt,
        venue: json.event.venue,
        orderNumber: json.order.id,
      }));
      saveTicketsLocal(stored);
      setTickets(stored);
      const first = String(json.order.fullName).split(' ')[0];
      const fromOrder = String(json.order.referralCode || '').trim();
      let fromLink = '';
      try {
        fromLink = sessionStorage.getItem('xoral-party-ref') || '';
      } catch { /* ignore */ }
      setSalesCode(fromOrder || fromLink);
      if (json.order.showOnGuestWall) {
        addGuestWall({ firstName: first, instagram: json.order.instagram });
      }
      setCelebrate(true);
      setProcessing(false);
      return true;
    }

    void (async () => {
      while (!cancelled && attempts < 12) {
        const done = await verifyOnce();
        if (done) return;
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
      if (!cancelled) {
        setError('Payment is still processing. Check your email in a minute, or refresh this page.');
        setProcessing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (error) {
    return (
      <div className="xp-wrap pt-28 pb-24">
        <h1 className="xp-display text-4xl">PAYMENT NOT CONFIRMED</h1>
        <p className="mt-4 text-white/70">{error}</p>
        <Link href="/party/checkout" className="xp-btn xp-btn-ghost mt-8">Back to checkout</Link>
      </div>
    );
  }

  if (processing || tickets.length === 0) {
    return <div className="xp-wrap pt-28 pb-24 text-white/60">Confirming payment with OPay…</div>;
  }

  return (
    <div className="xp-wrap pt-28 pb-24 text-center relative overflow-hidden">
      {celebrate && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                left: `${(i * 17) % 100}%`,
                top: '-8px',
                background: i % 2 ? '#e8c36a' : '#ff2d8a',
                animation: `xpFloat ${3 + (i % 4)}s linear ${i * 0.08}s infinite`,
              }}
            />
          ))}
        </div>
      )}
      <p className="xp-kicker">You&apos;re in.</p>
      <h1 className="xp-display text-5xl md:text-7xl mt-4">YOU&apos;RE IN.</h1>
      <p className="mt-4 text-xl text-white/70">Tickets are on this phone and in your email.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href={`/party/ticket/${tickets[0].id}`} className="xp-btn xp-btn-primary">
          View my ticket
        </Link>
      </div>
      <AttendShare salesCode={salesCode} />
    </div>
  );
}
