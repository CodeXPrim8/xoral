'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HeroContent } from '@/lib/cms/catalog';
import { HeroBanner } from './HeroBanner';

const ROTATE_MS = 12000;
const LAST_HERO_KEY = 'xoral-last-hero-slug';

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function readLastHeroSlug(): string | null {
  try {
    return sessionStorage.getItem(LAST_HERO_KEY);
  } catch {
    return null;
  }
}

function writeLastHeroSlug(slug: string) {
  try {
    sessionStorage.setItem(LAST_HERO_KEY, slug);
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

function pickStartIndex(deck: HeroContent[], avoidSlug: string | null) {
  if (deck.length <= 1) return 0;
  if (!avoidSlug) return 0;

  const avoidIndex = deck.findIndex((hero) => hero.slug === avoidSlug);
  if (avoidIndex < 0) return 0;

  return (avoidIndex + 1) % deck.length;
}

type HeroCarouselProps = {
  heroes: HeroContent[];
  getWatchProgress: (slug: string) => number;
};

export function HeroCarousel({ heroes, getWatchProgress }: HeroCarouselProps) {
  const [deck, setDeck] = useState<HeroContent[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  const signature = useMemo(() => heroes.map((hero) => hero.id ?? hero.slug).join('|'), [heroes]);

  const startFreshDeck = useCallback(
    (avoidSlug: string | null) => {
      if (heroes.length === 0) return;
      const shuffled = shuffle(heroes);
      setDeck(shuffled);
      setIndex(pickStartIndex(shuffled, avoidSlug));
      setPaused(false);
      setFading(false);
    },
    [heroes]
  );

  useEffect(() => {
    if (heroes.length === 0) return;
    startFreshDeck(readLastHeroSlug());
  }, [signature, heroes, startFreshDeck]);

  const activeHero = deck[index] ?? heroes[0];

  useEffect(() => {
    if (!activeHero) return;
    writeLastHeroSlug(activeHero.slug);
    return () => writeLastHeroSlug(activeHero.slug);
  }, [activeHero]);

  const advance = useCallback(() => {
    if (heroes.length <= 1) return;
    setFading(true);
    window.setTimeout(() => {
      setIndex((current) => {
        const next = current + 1;
        if (next >= deck.length) {
          setDeck(shuffle(heroes));
          return 0;
        }
        return next;
      });
      setFading(false);
    }, 350);
  }, [deck.length, heroes]);

  useEffect(() => {
    if (heroes.length <= 1 || paused || !activeHero) return;
    const timer = window.setInterval(advance, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [heroes.length, paused, activeHero?.slug, advance]);

  if (!activeHero) return null;

  return (
    <div className="relative">
      <div
        className={`smooth-transition ${fading ? 'opacity-0' : 'opacity-100'}`}
        aria-live="polite"
      >
        <HeroBanner
          key={`${activeHero.id ?? activeHero.slug}-${index}`}
          {...activeHero}
          watchProgressPercent={getWatchProgress(activeHero.slug)}
          onPlaybackChange={setPaused}
        />
      </div>

    </div>
  );
}
