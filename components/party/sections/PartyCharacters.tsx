'use client';

import { useState } from 'react';
import type { PartyCharacter } from '@/lib/party/types';

export function PartyCharacters({ characters }: { characters: PartyCharacter[] }) {
  const [open, setOpen] = useState<PartyCharacter | null>(null);

  return (
    <section className="xp-section" id="universe">
      <div className="xp-wrap">
        <p className="xp-kicker">05 — The characters</p>
        <h2 className="xp-display mt-3 text-[2rem] sm:text-4xl md:text-6xl">THEY&apos;RE GETTING READY.</h2>
        <p className="mt-3 text-white/60">Meet some of the faces on the other side. They&apos;ll cross over 30 September. Swipe to see more.</p>
      </div>
      <div className="xp-h-scroll mt-8 px-[max(1rem,calc((100%-1180px)/2))]">
        {characters.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOpen(c)}
            className="min-w-[min(78vw,240px)] w-[min(78vw,240px)] md:min-w-[240px] md:w-[240px] text-left active:scale-[0.98] transition-transform"
          >
            <div className="h-72 md:h-80 w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5">
              <img src={c.image} alt={c.name} className="h-full w-full object-cover pointer-events-none" />
            </div>
            <p className="mt-3 xp-display text-xl md:text-2xl">{c.name}</p>
            <p className="text-sm text-white/55">{c.role}</p>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="xp-glass w-full md:max-w-lg rounded-t-[1.75rem] md:rounded-[1.5rem] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-h-[90svh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={open.image} alt="" className="h-48 w-full object-cover rounded-2xl" />
            <h3 className="xp-display text-3xl md:text-4xl mt-5">{open.name}</h3>
            <p className="mt-2 text-[var(--xp-gold)]">{open.role}</p>
            <p className="mt-4 text-white/70">{open.personality}</p>
            <p className="mt-4 italic text-white/80">“{open.quote}”</p>
            <button type="button" className="xp-btn xp-btn-ghost mt-6" onClick={() => setOpen(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
