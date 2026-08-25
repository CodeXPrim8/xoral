'use client';

import { useState } from 'react';
import type { FaqItem } from '@/lib/party/types';

export function PartyFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section className="xp-section" id="faq">
      <div className="xp-wrap max-w-3xl">
        <p className="xp-kicker">FAQ</p>
        <h2 className="xp-display mt-3 text-[2rem] sm:text-4xl">BEFORE 30 SEPTEMBER.</h2>
        <div className="mt-8 divide-y divide-white/10">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full text-left py-4 min-h-14 touch-manipulation"
              onClick={() => setOpen((v) => (v === item.id ? null : item.id))}
            >
              <p className="font-semibold">{item.question}</p>
              {open === item.id && <p className="mt-3 text-white/65 leading-relaxed">{item.answer}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
