'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { ContentCard } from '@/components/ContentCard';
import { Bookmark, Clock, Check } from 'lucide-react';
import { useCatalog } from '@/components/CatalogProvider';
import { getWatchlist, getWatched } from '@/lib/user-data';

export default function LibraryPage() {
  const catalog = useCatalog();
  const [activeTab, setActiveTab] = useState<'continue' | 'watchlist' | 'watched'>('continue');
  const [watchlistSlugs, setWatchlistSlugs] = useState<string[]>([]);
  const [watchedSlugs, setWatchedSlugs] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const [watchlist, watched] = await Promise.all([getWatchlist(), getWatched()]);
      setWatchlistSlugs(watchlist);
      setWatchedSlugs(watched);
    }
    load();
  }, [activeTab]);

  const allTitles = catalog.titles;

  const watchlistItems = useMemo(
    () => allTitles.filter((title) => watchlistSlugs.includes(title.slug)),
    [allTitles, watchlistSlugs]
  );

  const watchedItems = useMemo(
    () => allTitles.filter((title) => watchedSlugs.includes(title.slug)),
    [allTitles, watchedSlugs]
  );

  const emptyMessages = {
    continue: 'Nothing in progress yet. Start watching on the home page.',
    watchlist: 'Your watchlist is empty. Add titles from any title page.',
    watched: 'You have not marked anything as watched yet.',
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page py-12 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">My Library</h1>
          </div>
          <p className="text-foreground/60">Your personal XORAL collection of movies and series</p>
        </div>

        <div className="flex gap-2 border-b border-border/30 overflow-x-auto">
          {[
            { id: 'continue', label: 'Continue Watching', icon: Clock },
            { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
            { id: 'watched', label: 'Watched', icon: Check },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as 'continue' | 'watchlist' | 'watched')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 smooth-transition whitespace-nowrap ${
                activeTab === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'continue' && (
            catalog.nextWatch.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {catalog.nextWatch.map((item) => (
                  <ContentCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="glass-card border rounded-xl p-12 text-center text-foreground/60">
                {emptyMessages.continue}
              </div>
            )
          )}

          {activeTab === 'watchlist' && (
            watchlistItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchlistItems.map((item) => (
                  <ContentCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="glass-card border rounded-xl p-12 text-center text-foreground/60">
                {emptyMessages.watchlist}
              </div>
            )
          )}

          {activeTab === 'watched' && (
            watchedItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchedItems.map((item) => (
                  <ContentCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="glass-card border rounded-xl p-12 text-center text-foreground/60">
                {emptyMessages.watched}
              </div>
            )
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
