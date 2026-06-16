'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play } from 'lucide-react';
import { toast } from 'sonner';
import { getTitleBySlug } from '@/lib/catalog';
import { markWatched, requireAuthForAction } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SafeImage } from './SafeImage';

export function WatchPlayer({ slug }: { slug: string }) {
  const router = useRouter();
  const title = getTitleBySlug(slug);

  if (!title) return null;

  async function handleMarkWatched() {
    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction(`/watch/${slug}`);
      if (!allowed) {
        toast.info('Sign in to track watched titles on XORAL');
        return;
      }
    }
    await markWatched(slug);
    toast.success('Marked as watched');
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground smooth-transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="relative aspect-video rounded-2xl overflow-hidden glass-card border bg-black">
        <SafeImage src={title.image} alt={title.title} fallbackSrc="/placeholder.jpg" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <Play className="w-16 h-16 text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-black mb-2">{title.title}</h1>
          <p className="text-foreground/70 max-w-lg mb-6">
            Full streaming playback is coming soon. Mark as watched to save progress to your XORAL account.
          </p>
          <button
            type="button"
            onClick={handleMarkWatched}
            className="glass-button px-8 py-3 rounded-lg font-bold"
          >
            Mark as Watched
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href={`/title/${slug}`} className="text-primary hover:underline text-sm font-semibold">
          View title details
        </Link>
        <span className="text-foreground/40">•</span>
        <span className="text-sm text-foreground/60">{title.genre} · {title.maturityRating}+ · ★ {title.rating}/10</span>
      </div>
    </div>
  );
}
