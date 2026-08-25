'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { characterAssistantEnabled } from '@/lib/party/client-store';

const lines = [
  "You haven't got your ticket yet?",
  '30 September is going to be one of a kind.',
  "They're counting down over there.",
  "Come on. I'll show you around.",
];

export function FloatingCharacter({ enabled }: { enabled?: boolean }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [line, setLine] = useState(lines[0]);
  const [pos, setPos] = useState({ x: 24, y: 70 });

  const hide = pathname.startsWith('/party/checkout') || enabled === false;

  useEffect(() => {
    if (hide || !characterAssistantEnabled()) return;
    const t = window.setTimeout(() => setShow(true), 2400);
    const talk = window.setInterval(() => {
      setLine(lines[Math.floor(Math.random() * lines.length)]);
      setPos({
        x: 8 + Math.random() * 18,
        y: 58 + Math.random() * 22,
      });
    }, 9000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(talk);
    };
  }, [hide]);

  if (hide || !show) return null;

  return (
    <motion.button
      type="button"
      aria-label="Xoral character"
      onClick={() => setLine(lines[Math.floor(Math.random() * lines.length)])}
      className="fixed z-30 hidden md:flex items-end gap-3"
      style={{ right: `${pos.x}px`, bottom: `${pos.y}px` }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="xp-glass max-w-[180px] px-3 py-2 text-xs text-left">{line}</span>
      <span className="relative h-20 w-16 overflow-hidden rounded-t-full border border-white/20 bg-gradient-to-b from-fuchsia-500/40 to-black">
        <img src="/avatars/sandra-rosewood.svg" alt="" className="h-full w-full object-cover" />
      </span>
    </motion.button>
  );
}
