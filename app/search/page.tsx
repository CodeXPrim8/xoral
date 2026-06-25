'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { ContentCard } from '@/components/ContentCard';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCatalog } from '@/components/CatalogProvider';
import { searchCatalogTitles } from '@/lib/catalog';
import { SafeImage } from '@/components/SafeImage';

export default function SearchPage() {
  const catalog = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContent = useMemo(() => searchCatalogTitles(catalog, searchQuery), [catalog, searchQuery]);

  const filteredCharacters = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return [];
    return catalog.characters.filter(
      (character) =>
        character.name.toLowerCase().includes(normalized) ||
        character.profession.toLowerCase().includes(normalized) ||
        character.personality.toLowerCase().includes(normalized)
    );
  }, [catalog.characters, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page py-12 space-y-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Search</h1>
            <p className="text-foreground/60">Find your next favorite movie, series, or AI Star on XORAL</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-foreground/50" />
            <input
              type="text"
              placeholder="Search by title, actor, or genre..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-card/40 border border-border/50 rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-card/60 smooth-transition text-lg"
              autoFocus
            />
          </div>
        </div>

        {searchQuery ? (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {filteredContent.length > 0
                  ? `${filteredContent.length} title${filteredContent.length !== 1 ? 's' : ''}`
                  : 'No titles found'}
              </h2>
              {filteredContent.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredContent.map((item) => (
                    <ContentCard key={item.id} {...item} />
                  ))}
                </div>
              )}
            </div>

            {filteredCharacters.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">AI Stars</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredCharacters.map((character) => (
                    <Link
                      key={character.id}
                      href={`/ai-stars/${character.slug}`}
                      className="glass-card border rounded-xl p-4 text-center hover:bg-card/60 smooth-transition"
                    >
                      <SafeImage
                        src={character.image}
                        alt={character.name}
                        fallbackSrc="/placeholder-user.jpg"
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-primary/30"
                      />
                      <p className="font-semibold">{character.name}</p>
                      <p className="text-xs text-foreground/60 mt-1">{character.profession}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredContent.length === 0 && filteredCharacters.length === 0 && (
              <div className="glass-card border rounded-xl p-12 text-center">
                <p className="text-foreground/60 text-lg">Try searching for something else</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card border rounded-xl p-12 text-center">
            <Search className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <p className="text-foreground/60 text-lg">
              Start typing to search for movies, series, AI Stars, and more
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
