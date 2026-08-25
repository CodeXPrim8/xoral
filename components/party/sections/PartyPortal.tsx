'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function PartyPortal() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  function enter() {
    setOpen(true);
    setDone(false);
    window.setTimeout(() => setDone(true), 5200);
  }

  return (
    <section className="xp-section" id="portal">
      <div className="xp-wrap text-center">
        <p className="xp-kicker">06 — The portal</p>
        <h2 className="xp-display mt-3 text-[2.4rem] sm:text-5xl md:text-7xl">THE PORTAL</h2>
        <p className="mt-4 text-white/60">A short crossing. Skip anytime.</p>
        <button type="button" onClick={enter} className="mt-10 relative h-36 w-36 md:h-40 md:w-40 mx-auto rounded-full touch-manipulation">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--xp-magenta)] via-[var(--xp-violet)] to-[var(--xp-cyan)] blur-xl opacity-70 animate-pulse pointer-events-none" />
          <span className="relative grid h-full w-full place-items-center rounded-full border border-white/30 bg-black/40 xp-display">
            ENTER
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center text-center px-6"
            initial={{ opacity: 0, filter: 'blur(18px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 xp-icon-btn text-sm tracking-[0.2em] uppercase"
              onClick={() => setOpen(false)}
            >
              Skip
            </button>
            {!done ? (
              <>
                <motion.img
                  src="/avatars/sandra-rosewood.svg"
                  alt=""
                  className="h-40 w-40 rounded-full object-cover"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                />
                <motion.p
                  className="xp-display mt-8 text-3xl md:text-5xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  So you found us early.
                </motion.p>
              </>
            ) : (
              <>
                <p className="xp-display text-[2rem] sm:text-4xl md:text-6xl px-2">SEE YOU 30 SEPTEMBER</p>
                <Link href="/party/tickets" className="xp-btn xp-btn-primary mt-8 max-w-xs" onClick={() => setOpen(false)}>
                  Get my ticket
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
