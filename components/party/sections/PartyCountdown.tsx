'use client';

import { useEffect, useState } from 'react';

function parts(targetMs: number, now: number) {
  const diff = Math.max(0, targetMs - now);
  return {
    done: diff <= 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function PartyCountdown({ startsAt }: { startsAt: string }) {
  const targetMs = Date.parse(startsAt);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ready = now !== null;
  const time = ready ? parts(targetMs, now) : { done: false, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const cells = [
    ['Days', time.days],
    ['Hours', time.hours],
    ['Minutes', time.minutes],
    ['Seconds', time.seconds],
  ] as const;

  return (
    <section className="xp-section border-y border-white/10">
      <div className="xp-wrap text-center">
        <p className="xp-kicker">{time.done ? "We're live" : 'The worlds connect 30 September in'}</p>
        <h2 className="xp-display mt-4 text-[2rem] sm:text-4xl md:text-6xl">
          {time.done ? 'THE PORTAL IS OPEN' : 'COUNT IT DOWN'}
        </h2>
        {!time.done && (
          <div className="mt-8 md:mt-10 flex justify-center gap-1 sm:gap-3 md:gap-6">
            {cells.map(([label, value]) => (
              <div key={label} className="xp-glass xp-countdown-cell px-1.5 py-3 sm:px-2 sm:py-4 md:px-4 md:py-5">
                <p className="xp-display text-[1.35rem] sm:text-4xl md:text-6xl tabular-nums">
                  {String(value).padStart(2, '0')}
                </p>
                <p className="mt-1.5 md:mt-2 text-[8px] md:text-[10px] tracking-[0.12em] md:tracking-[0.18em] uppercase text-white/50">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
