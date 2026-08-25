'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { availabilityFromRemaining, availabilityLabel, formatEventDate } from '@/lib/party/format';
import { useLiveEvent } from '@/lib/party/use-live-event';
import type { PartyEvent } from '@/lib/party/types';

export function PartyHero({ event: initial }: { event: PartyEvent }) {
  const event = useLiveEvent(initial);
  const layer = useRef<HTMLDivElement>(null);
  const remaining = event.ticketTypes.reduce((sum, t) => sum + t.remaining, 0);
  const capacity = event.ticketTypes.reduce((sum, t) => sum + t.capacity, 0);
  const status = availabilityLabel(availabilityFromRemaining(remaining, capacity));

  useEffect(() => {
    const el = layer.current;
    if (!el) return;

    const move = (x: number, y: number) => {
      el.style.setProperty('--mx', `${x * 14}px`);
      el.style.setProperty('--my', `${y * 10}px`);
    };

    const onMouse = (e: MouseEvent) => {
      move(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('mousemove', onMouse);
    return () => {
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden">
      <div
        ref={layer}
        className="absolute inset-0 scale-110 pointer-events-none"
        style={{ transform: 'translate3d(var(--mx, 0), var(--my, 0), 0)' }}
      >
        <div className="absolute inset-0 bg-[#050308]" />
        <div className="xp-hero-lights" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,45,138,0.08)_48%,rgba(61,224,255,0.1)_52%,transparent_100%)]" />
        <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-1/2 mix-blend-screen opacity-70 bg-[radial-gradient(circle_at_70%_40%,rgba(122,60,255,0.45),transparent_42%)]" />
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="xp-particle"
            style={{
              left: `${(i * 17) % 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${7 + (i % 5)}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050308] via-[#050308]/40 to-transparent pointer-events-none" />

      <div className="xp-wrap relative z-10 w-full pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-[calc(var(--xp-sticky-h)+1.5rem)]">
        <p className="xp-kicker mb-3 md:mb-4">Coming 30 September 2026</p>
        <h1 className="xp-display text-[clamp(2.6rem,12.5vw,9rem)] text-white leading-[0.88] break-words">
          XORAL PARTY
        </h1>
        <p className="xp-display mt-3 md:mt-4 text-[clamp(1.2rem,6.4vw,3.75rem)] text-[var(--xp-gold)] leading-[1.05]">
          ONE PARTY. TWO WORLDS.
        </p>
        <p className="mt-3 md:mt-4 max-w-xl text-[0.95rem] md:text-lg text-white/75 leading-relaxed">{event.subtagline}</p>

        <div className="mt-5 md:mt-6 flex flex-wrap gap-2 text-[11px] md:text-sm">
          <span className="xp-glass px-3 py-2">{formatEventDate(event.startsAt)}</span>
          <span className="xp-glass px-3 py-2">{event.venue}, {event.address} · {event.city}</span>
          <span className="xp-glass px-3 py-2">{event.scheduleLabel}</span>
          <span className="xp-glass px-3 py-2 text-[var(--xp-gold)]">{status}</span>
        </div>

        <div className="mt-7 md:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 max-w-md">
          <Link href="/party/tickets" className="xp-btn xp-btn-primary">
            Get Tickets
          </Link>
          <a href="#universe" className="xp-btn xp-btn-ghost" onClick={(e) => {
            e.preventDefault();
            document.getElementById('universe')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>
            Enter the Universe
          </a>
        </div>
      </div>
    </section>
  );
}
