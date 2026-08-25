'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { setSoundEnabled, soundEnabled } from '@/lib/party/client-store';

export function SoundToggle({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    setOn(soundEnabled());
  }, []);

  function stop() {
    nodesRef.current.forEach((node) => {
      if ('stop' in node && typeof node.stop === 'function') node.stop();
    });
    void ctxRef.current?.close();
    ctxRef.current = null;
    nodesRef.current = [];
  }

  async function start() {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 48;
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    gain.gain.value = 0.03;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    nodesRef.current = [osc, filter, gain];
  }

  async function toggle() {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
    if (next) await start();
    else stop();
  }

  useEffect(() => () => stop(), []);

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className={compact ? 'xp-icon-btn text-white/80' : 'xp-glass px-3 py-2 text-xs tracking-[0.16em] uppercase flex items-center gap-2'}
      aria-label={on ? 'Mute sound' : 'Enter with sound'}
    >
      {on ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      {!compact && <span>{on ? 'Sound on' : 'Enter with sound'}</span>}
    </button>
  );
}
