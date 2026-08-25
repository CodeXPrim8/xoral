'use client';

import { useMemo, useState } from 'react';
import type { GalleryItem } from '@/lib/party/types';

const cats = [
  { id: 'all', label: 'All' },
  { id: 'people', label: 'The People' },
  { id: 'energy', label: 'The Energy' },
  { id: 'fits', label: 'The Fits' },
  { id: 'moments', label: 'The Moments' },
] as const;

export function PartyGallery({ items, compact }: { items: GalleryItem[]; compact?: boolean }) {
  const [cat, setCat] = useState<(typeof cats)[number]['id']>('all');
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const filtered = useMemo(() => (cat === 'all' ? items : items.filter((i) => i.category === cat)), [cat, items]);
  const shown = compact ? filtered.slice(0, 6) : filtered;

  return (
    <section className="xp-section" id="gallery">
      <div className="xp-wrap">
        <p className="xp-kicker">Before the night</p>
        <h2 className="xp-display mt-3 text-[2rem] sm:text-4xl md:text-6xl">PARTY GALLERY</h2>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 touch-pan-x">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`shrink-0 min-h-11 px-4 py-2 rounded-full text-xs tracking-[0.16em] uppercase border touch-manipulation ${
                cat === c.id ? 'border-[var(--xp-gold)] text-[var(--xp-gold)]' : 'border-white/15 text-white/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {shown.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpen(item)}
              className="block w-full overflow-hidden rounded-2xl border border-white/10 min-h-[120px] touch-manipulation"
            >
              <img src={item.src} alt={item.alt} className="w-full h-40 md:h-52 object-cover pointer-events-none" />
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/35">Upload after each edition from Admin → Party Gallery. Placeholders until then.</p>
      </div>
      {open && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]" onClick={() => setOpen(null)}>
          <button type="button" className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 xp-icon-btn" aria-label="Close">
            ✕
          </button>
          <img src={open.src} alt={open.alt} className="max-h-[80svh] max-w-full object-contain pointer-events-none" />
        </div>
      )}
    </section>
  );
}
