'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bookmark, Play, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getTitleBySlug, getCastForTitle } from '@/lib/catalog';
import { isInWatchlist, toggleWatchlist, requireAuthForAction } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SafeImage } from './SafeImage';

export function TitleActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    isInWatchlist(slug).then(setSaved);
  }, [slug]);

  async function handleToggleWatchlist() {
    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction(`/title/${slug}`);
      if (!allowed) {
        toast.info('Sign in to save titles to your XORAL account');
        return;
      }
    }
    const next = await toggleWatchlist(slug);
    setSaved(next.includes(slug));
    toast.success(next.includes(slug) ? 'Added to My List' : 'Removed from My List');
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => router.push(`/watch/${slug}`)}
        className="flex items-center gap-2 bg-white text-background px-8 py-3 rounded font-bold hover:bg-white/80 smooth-transition"
      >
        <Play className="w-5 h-5 fill-current" />
        Play
      </button>
      <button
        type="button"
        onClick={handleToggleWatchlist}
        className="flex items-center gap-2 glass-card border px-8 py-3 rounded font-bold hover:bg-card/60 smooth-transition"
      >
        {saved ? <Bookmark className="w-5 h-5 fill-current" /> : <Plus className="w-5 h-5" />}
        {saved ? 'In My List' : 'Add to List'}
      </button>
    </div>
  );
}

export function TitleDetail({ slug }: { slug: string }) {
  const title = getTitleBySlug(slug);
  if (!title) return null;

  const cast = getCastForTitle(slug);

  return (
    <div className="space-y-8">
      <div className="relative rounded-2xl overflow-hidden min-h-[420px]">
        <SafeImage src={title.image} alt={title.title} fallbackSrc="/placeholder.jpg" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        <div className="relative p-8 md:p-12 flex flex-col justify-end min-h-[420px] max-w-3xl">
          {title.subtitle && <p className="text-sm font-semibold text-foreground/80 mb-2">{title.subtitle}</p>}
          <h1 className="text-4xl md:text-6xl font-black mb-4">{title.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70 mb-4">
            <span className="border border-foreground/40 px-2 py-0.5 font-bold">{title.maturityRating}+</span>
            <span>{title.genre}</span>
            <span>★ {title.rating}/10</span>
            <span className="capitalize">{title.type}</span>
            {title.isAiGenerated && <span className="text-primary font-semibold">AI Original</span>}
          </div>
          <p className="text-foreground/85 leading-relaxed mb-6">{title.description}</p>
          <TitleActions slug={slug} />
        </div>
      </div>

      {cast.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Cast</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cast.map((character) => (
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
                <p className="font-semibold text-sm">{character.name}</p>
                <p className="text-xs text-foreground/60 mt-1">{character.profession}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
