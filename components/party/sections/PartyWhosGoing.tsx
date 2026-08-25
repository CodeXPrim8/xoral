'use client';

import { useEffect, useState } from 'react';
import { readGuestWall } from '@/lib/party/client-store';
import type { GuestWallEntry } from '@/lib/party/types';

export function PartyWhosGoing() {
  const [guests, setGuests] = useState<GuestWallEntry[]>([]);

  useEffect(() => {
    setGuests(readGuestWall());
  }, []);

  return (
    <section className="xp-section" id="going">
      <div className="xp-wrap">
        <p className="xp-kicker">The city is locking in</p>
        <h2 className="xp-display mt-3 text-[2rem] sm:text-4xl md:text-6xl">WHO&apos;S GOING?</h2>
        <p className="mt-4 text-2xl text-[var(--xp-gold)]">
          {guests.length} {guests.length === 1 ? 'person' : 'people'} locked in for 30 September
        </p>
        <p className="mt-2 text-sm text-white/40">Count is from guests who opted into the wall after purchase. No fake numbers.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {guests.length === 0 && <p className="text-white/50">Be the first name on the wall.</p>}
          {guests.map((g, i) => (
            <div key={`${g.firstName}-${i}`} className="xp-glass px-4 py-3">
              <p className="font-semibold">{g.firstName}</p>
              {g.instagram && <p className="text-xs text-white/50">@{g.instagram.replace('@', '')}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
