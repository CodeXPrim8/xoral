'use client';

import Link from 'next/link';
import { availabilityFromRemaining, availabilityLabel, formatEventDate } from '@/lib/party/format';
import { useLiveEvent } from '@/lib/party/use-live-event';
import type { PartyEvent } from '@/lib/party/types';

export function PartyNextEvent({ event: initial }: { event: PartyEvent }) {
  const event = useLiveEvent(initial);
  const remaining = event.ticketTypes.reduce((s, t) => s + t.remaining, 0);
  const capacity = event.ticketTypes.reduce((s, t) => s + t.capacity, 0);
  const status = availabilityLabel(availabilityFromRemaining(remaining, capacity));

  return (
    <section className="xp-section" id="event">
      <div className="xp-wrap">
        <p className="xp-kicker">30 September 2026</p>
        <div className="xp-glass mt-6 overflow-hidden p-5 md:p-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h2 className="xp-display text-[1.85rem] sm:text-4xl md:text-7xl break-words">
                {event.name} — {event.volume}
              </h2>
              <p className="mt-4 text-white/70">
                {formatEventDate(event.startsAt)} · {event.scheduleLabel}
              </p>
              <p className="mt-1 text-white/70">
                {event.venue}, {event.address} · {event.city}
              </p>
            </div>
            <span className="xp-glass px-4 py-2 text-[var(--xp-gold)]">{status}</span>
          </div>

          <dl className="mt-8 grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <dt className="text-white/40 uppercase tracking-[0.18em] text-xs">Dress code</dt>
              <dd className="mt-1">{event.dressCode}</dd>
            </div>
            <div>
              <dt className="text-white/40 uppercase tracking-[0.18em] text-xs">Age</dt>
              <dd className="mt-1">{event.ageRequirement}</dd>
            </div>
          </dl>

          <ul className="mt-8 space-y-3">
            {event.ticketTypes.map((ticket) => {
              const soldOut = ticket.remaining <= 0;
              return (
                <li key={ticket.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className={soldOut ? 'text-white/40' : 'text-white/80'}>{ticket.name}</span>
                  <span className={soldOut ? 'text-white/35 uppercase tracking-[0.16em] text-[10px]' : 'text-[var(--xp-gold)] uppercase tracking-[0.16em] text-[10px]'}>
                    {soldOut ? 'Sold out' : 'Available'}
                  </span>
                </li>
              );
            })}
          </ul>

          <Link href="/party/tickets" className="xp-btn xp-btn-primary mt-10 inline-flex">
            Get Tickets
          </Link>
        </div>
      </div>
    </section>
  );
}
