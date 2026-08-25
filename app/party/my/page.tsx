'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readTickets, type StoredTicket } from '@/lib/party/client-store';

export default function MyXoralPage() {
  const [tickets, setTickets] = useState<StoredTicket[]>([]);

  useEffect(() => {
    setTickets(readTickets());
  }, []);

  return (
    <div className="xp-wrap pt-28 pb-24">
      <p className="xp-kicker">Optional account later</p>
      <h1 className="xp-display text-5xl mt-3">MY XORAL</h1>
      <p className="mt-3 text-white/60">Tickets on this device. Create an account later to sync across phones.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tickets.length === 0 && <p className="text-white/50">No tickets yet.</p>}
        {tickets.map((t) => (
          <Link key={t.id} href={`/party/ticket/${t.id}`} className="xp-glass p-5 block">
            <p className="xp-display text-2xl">{t.eventName}</p>
            <p className="mt-2 text-white/60">{t.ticketTypeName}</p>
            <p className="text-sm text-white/40">{t.id}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
