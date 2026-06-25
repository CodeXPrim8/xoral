'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import { useCatalog } from '@/components/CatalogProvider';
import { filterCatalogTitles, type BrowseTypeFilter } from '@/lib/catalog';
import { genres } from '@/lib/data';

const typeTabs: { value: BrowseTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
];

function parseType(value: string | null): BrowseTypeFilter {
  if (value === 'movie' || value === 'series') return value;
  return 'all';
}

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catalog = useCatalog();

  const type = parseType(searchParams.get('type'));
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [sort, setSort] = useState('Latest');

  const titles = useMemo(
    () => filterCatalogTitles(catalog, { query, genre, sort, type }),
    [catalog, query, genre, sort, type]
  );

  function setType(next: BrowseTypeFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('type');
    else params.set('type', next);
    const qs = params.toString();
    router.replace(qs ? `/browse?${qs}` : '/browse', { scroll: false });
  }

  const heading =
    type === 'movie' ? 'Movies' : type === 'series' ? 'Series' : 'Browse';

  const subtitle =
    type === 'movie'
      ? 'Films and AI originals on XORAL'
      : type === 'series'
        ? 'Binge-worthy series on XORAL'
        : 'Explore movies, series, and more on XORAL';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-foreground">{heading}</h1>
          <p className="text-lg text-foreground/70">{subtitle}</p>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setType(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap smooth-transition border ${
                type === tab.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card/40 text-foreground/70 border-border hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
