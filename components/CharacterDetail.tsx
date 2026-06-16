'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { characters, getCharacterBySlug } from '@/lib/characters';
import { getTitlesByCharacterId } from '@/lib/catalog';
import { ContentCard } from '@/components/ContentCard';
import { isCharacterFollowed, toggleCharacterFollow, requireAuthForAction } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { toast } from 'sonner';
import { SafeImage } from '@/components/SafeImage';

export function CharacterDetail({ slug }: { slug: string }) {
  const character = getCharacterBySlug(slug);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (character) {
      isCharacterFollowed(character.id).then(setFollowing);
    }
  }, [character]);

  if (!character) return null;

  const filmography = getTitlesByCharacterId(character.id);

  return (
    <div className="space-y-8">
      <div className="glass-card border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <SafeImage
            src={character.image}
            alt={character.name}
            fallbackSrc="/placeholder-user.jpg"
            className="w-48 h-48 rounded-2xl object-cover border-4 border-primary/30 mx-auto md:mx-0"
          />
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary font-semibold">AI Star</p>
              <h1 className="text-4xl md:text-5xl font-black">{character.name}</h1>
              <p className="text-foreground/70 mt-2">{character.description}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="glass-card border px-3 py-1 rounded-full">{character.profession}</span>
              <span className="glass-card border px-3 py-1 rounded-full">{character.nationality}</span>
              {character.age && (
                <span className="glass-card border px-3 py-1 rounded-full">Age {character.age}</span>
              )}
              <span className="glass-card border px-3 py-1 rounded-full">{filmography.length} titles</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (isSupabaseConfigured()) {
                  const allowed = await requireAuthForAction(`/ai-stars/${slug}`);
                  if (!allowed) {
                    toast.info('Sign in to follow AI Stars on XORAL');
                    return;
                  }
                }
                const next = await toggleCharacterFollow(character.id);
                setFollowing(next.characters.includes(character.id));
              }}
              className="glass-button px-6 py-2 rounded-lg font-semibold"
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      <section className="glass-card border rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            ['Height', character.height],
            ['Eyes', character.eyes],
            ['Hair', character.hair],
            ['Personality', character.personality],
            ['Style', character.style],
            ['Voice', character.voice],
            ['Skin', character.skinColor],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-border/40 pb-3">
              <dt className="text-foreground/50">{label}</dt>
              <dd className="font-medium mt-1">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Filmography</h2>
        {filmography.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filmography.map((title) => (
              <ContentCard key={title.id} {...title} href={`/title/${title.slug}`} />
            ))}
          </div>
        ) : (
          <div className="glass-card border rounded-xl p-8 text-center text-foreground/60">
            No titles linked yet.
          </div>
        )}
      </section>

      <Link href="/ai-stars" className="inline-block text-sm text-primary hover:underline">
        ← Back to all AI Stars
      </Link>
    </div>
  );
}

export function MeetTheCast() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Meet the Cast</h2>
        <p className="text-foreground/60">XORAL&apos;s virtual AI Stars bringing every story to life</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {characters.slice(0, 7).map((character) => (
          <Link
            key={character.id}
            href={`/ai-stars/${character.slug}`}
            className="glass-card p-4 rounded-xl border text-center hover:bg-card/60 smooth-transition"
          >
            <SafeImage
              src={character.image}
              alt={character.name}
              fallbackSrc="/placeholder-user.jpg"
              className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-primary/30"
            />
            <h3 className="font-bold text-sm text-foreground">{character.name}</h3>
            <p className="text-xs text-foreground/60 mt-1">{character.profession}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
