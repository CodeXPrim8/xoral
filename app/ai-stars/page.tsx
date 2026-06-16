'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { ContentCard } from '@/components/ContentCard';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { characters } from '@/lib/characters';
import { getCharacterAppearances } from '@/lib/catalog';
import { aiMovies } from '@/lib/data';
import { isCharacterFollowed, toggleCharacterFollow, requireAuthForAction } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SafeImage } from '@/components/SafeImage';

export default function AIStarsPage() {
  const [followed, setFollowed] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const ids = await Promise.all(
        characters.map(async (c) => ((await isCharacterFollowed(c.id)) ? c.id : null))
      );
      setFollowed(ids.filter(Boolean) as string[]);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="text-4xl md:text-5xl font-black text-foreground">AI Stars</h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Meet XORAL&apos;s virtual cast — {characters.length} AI performers revolutionizing cinema with precision, versatility, and unforgettable presence.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">All AI Stars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {characters.map((character) => {
              const appearances = getCharacterAppearances(character.id);
              const isFollowed = followed.includes(character.id);

              return (
                <div
                  key={character.id}
                  className="glass-card p-6 rounded-xl border overflow-hidden hover:bg-card/60 smooth-transition group"
                >
                  <Link href={`/ai-stars/${character.slug}`} className="block">
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <SafeImage
                        src={character.image}
                        alt={character.name}
                        fallbackSrc="/placeholder-user.jpg"
                        className="w-full aspect-square object-cover group-hover:scale-110 smooth-transition"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{character.name}</h3>
                    <p className="text-sm text-foreground/70 mb-1">{character.profession}</p>
                    <p className="text-sm text-foreground/60 mb-4 line-clamp-2">{character.personality}</p>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-accent font-semibold">
                      {appearances} Appearance{appearances !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (isSupabaseConfigured()) {
                          const allowed = await requireAuthForAction('/ai-stars');
                          if (!allowed) {
                            toast.info('Sign in to follow AI Stars on XORAL');
                            return;
                          }
                        }
                        const next = await toggleCharacterFollow(character.id);
                        setFollowed(next.characters);
                      }}
                      className="glass-button px-3 py-1 rounded-lg text-sm font-semibold"
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Featured Content</h2>
            <p className="text-foreground/60">Movies and series featuring XORAL AI Stars</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {aiMovies.map((movie) => (
              <ContentCard key={movie.id} {...movie} href={`/title/${movie.slug}`} />
            ))}
          </div>
        </section>

        <section className="glass-card border rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">About AI Stars on XORAL</h2>
          <div className="space-y-4 text-foreground/80">
            <p>
              Our AI Stars represent the pinnacle of artificial intelligence in entertainment. Using advanced neural networks, these digital performers embody any character, emotion, or performance style.
            </p>
            <p>
              Each AI Star is trained on diverse performance data to deliver authentic, nuanced performances — and can appear across multiple XORAL originals while keeping a unique presence.
            </p>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
