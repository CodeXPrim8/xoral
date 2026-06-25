'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import { useCatalog } from '@/components/CatalogProvider';
import { filterCatalogTitles } from '@/lib/catalog';
import { genres } from '@/lib/data';

type BrowseType = 'all' | 'movie' | 'series';

const TYPE_TABS: { id: BrowseType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'series', label: 'Series' },
];

const HEADINGS: Record<BrowseType, { title: string; subtitle: string }> = {
  all: {
    title: 'Browse',
    subtitle: 'Explore movies, series, and more across the XORAL catalog',
  },
  movie: {
    title: 'Movies',
    subtitle: 'Films and standalone features on XORAL',
  },
  series: {
    title: 'Series',
    subtitle: 'Multi-episode shows and serialized stories',
  },
};

function parseBrowseType(value: string | null): BrowseType {
  if (value === 'movie' || value === 'series') return value;
  return 'all';
}

export function BrowseContent() {
  const catalog = useCatalog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentType = parseBrowseType(searchParams.get('type'));
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [sort, setSort] = useState('Latest');

  const titles = useMemo(
    () => filterCatalogTitles(catalog, { query, genre, sort, type: contentType }),
    [catalog, query, genre, sort, contentType]
  );

  const heading = HEADINGS[contentType];

  function setContentType(type: BrowseType) {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') params.delete('type');
    else params.set('type', type);
    const qs = params.toString();
    router.replace(qs ? `/browse?${qs}` : '/browse', { scroll: false });
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-foreground">{heading.title}</h1>
          <p className="text-lg text-foreground/70">{heading.subtitle}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TYPE_TABS.map((tab) => {
            const active = contentType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setContentType(tab.id)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold smooth-transition ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground/70 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="glass-card p-6 rounded-xl border space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search titles..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 bg-input/50 border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
            />
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="bg-input/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
            >
              {genres.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="bg-input/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
            >
              <option>Latest</option>
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Trending</option>
            </select>
          </div>
        </div>

        {titles.length > 0 ? (
          <FeaturedGrid title={`${titles.length} titles`} items={titles} />
        ) : (
          <div className="glass-card border rounded-xl p-12 text-center text-foreground/60">
            No titles match your filters.
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
