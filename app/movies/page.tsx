'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { FeaturedGrid } from '@/components/FeaturedGrid';
import { filterTitles } from '@/lib/catalog';
import { genres } from '@/lib/data';

export default function MoviesPage() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [sort, setSort] = useState('Latest');

  const movies = useMemo(
    () => filterTitles({ query, genre, sort }),
    [query, genre, sort]
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-foreground">All Movies</h1>
          <p className="text-lg text-foreground/70">Explore the XORAL catalog of films and series</p>
        </div>

        <div className="glass-card p-6 rounded-xl border space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search movies..."
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

        {movies.length > 0 ? (
          <FeaturedGrid title={`${movies.length} titles`} items={movies} />
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
