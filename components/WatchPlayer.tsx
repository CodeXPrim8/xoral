'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useCatalog } from '@/components/CatalogProvider';
import { findTitleInCatalog } from '@/lib/cms/catalog';
import { episodeProgressKey, findEpisode, getDefaultEpisode } from '@/lib/cms/episodes';
import { titlePath, watchPath } from '@/lib/cms/paths';
import { markWatched, requireAuthForAction } from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getResumeSeconds, savePlaybackPosition } from '@/lib/playback-progress';
import { SafeImage } from './SafeImage';

export function WatchPlayer({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catalog = useCatalog();
  const title = findTitleInCatalog(catalog, slug);
  const videoRef = useRef<HTMLVideoElement>(null);

  const seasonParam = Number(searchParams.get('s') ?? '0');
  const episodeParam = Number(searchParams.get('e') ?? '0');

  const activeEpisode = useMemo(() => {
    if (!title?.seasons?.length) return null;
    if (seasonParam > 0 && episodeParam > 0) {
      return findEpisode(title.seasons, seasonParam, episodeParam);
    }
    return getDefaultEpisode(title.seasons);
  }, [title, seasonParam, episodeParam]);

  const playbackSlug = useMemo(() => {
    if (activeEpisode) {
      return episodeProgressKey(slug, activeEpisode.seasonNumber, activeEpisode.episodeNumber);
    }
    return slug;
  }, [slug, activeEpisode]);

  const videoUrl = activeEpisode?.videoUrl ?? title?.videoUrl;
  const continueItem = catalog.nextWatch.find((item) => item.slug === slug);

  const persistProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    savePlaybackPosition(playbackSlug, video.currentTime);
  }, [playbackSlug]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const applyResume = () => {
      const resumeAt = getResumeSeconds(
        playbackSlug,
        video.duration,
        continueItem?.progress ?? 0
      );
      if (resumeAt > 0) {
        video.currentTime = resumeAt;
      }
    };

    const onTimeUpdate = () => persistProgress();
    const onPause = () => persistProgress();

    video.addEventListener('loadedmetadata', applyResume);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);

    if (video.readyState >= 1) {
      applyResume();
    }

    return () => {
      video.removeEventListener('loadedmetadata', applyResume);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
    };
  }, [playbackSlug, videoUrl, continueItem?.progress, persistProgress]);

  if (!title) return null;

  async function handleMarkWatched() {
    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction(watchPath(slug));
      if (!allowed) {
        toast.info('Sign in to track watched titles on XORAL');
        return;
      }
    }
    await markWatched(slug);
    toast.success('Marked as watched');
  }

  const episodeLabel = activeEpisode
    ? `S${activeEpisode.seasonNumber} E${activeEpisode.episodeNumber} · ${activeEpisode.title}`
    : null;

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

      {title.seasons && title.seasons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Episodes</h2>
          {title.seasons.map((season) => (
            <div key={season.id} className="space-y-2">
              <p className="text-sm font-semibold text-foreground/80">
                Season {season.seasonNumber}
                {season.title ? ` · ${season.title}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {season.episodes.map((episode) => {
                  const active =
                    activeEpisode?.seasonNumber === season.seasonNumber &&
                    activeEpisode?.episodeNumber === episode.episodeNumber;
                  return (
                    <Link
                      key={episode.id}
                      href={watchPath(slug, { s: season.seasonNumber, e: episode.episodeNumber })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border smooth-transition ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-card/60'
                      } ${!episode.videoUrl ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      E{episode.episodeNumber}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative aspect-video rounded-2xl overflow-hidden glass-card border bg-black">
        {videoUrl ? (
          <>
            {episodeLabel && (
              <p className="absolute top-3 left-3 z-10 text-xs font-semibold bg-background/80 px-2 py-1 rounded">
                {episodeLabel}
              </p>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              playsInline
              poster={title.image}
              className="w-full h-full object-contain bg-black"
            />
          </>
        ) : (
          <>
            <SafeImage src={title.image} alt={title.title} fallbackSrc="/placeholder.jpg" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Play className="w-16 h-16 text-primary mb-4" />
              <h1 className="text-3xl md:text-4xl font-black mb-2">{title.title}</h1>
              <p className="text-foreground/70 max-w-lg mb-6">
                {title.type === 'series'
                  ? 'Upload episode videos in Admin → Titles → Episodes.'
                  : 'Add a video in Admin → Titles to enable playback.'}
              </p>
              <button
                type="button"
                onClick={handleMarkWatched}
                className="glass-button px-8 py-3 rounded-lg font-bold"
              >
                Mark as Watched
              </button>
            </div>
          </>
        )}
      </div>

      {videoUrl && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleMarkWatched}
            className="glass-button px-6 py-2 rounded-lg font-semibold"
          >
            Mark as Watched
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Link href={titlePath(slug)} className="text-primary hover:underline text-sm font-semibold">
          View title details
        </Link>
        <span className="text-foreground/40">•</span>
        <span className="text-sm text-foreground/60">
          {title.genre} · {title.maturityRating}+ · ★ {title.rating}/10
        </span>
      </div>
    </div>
  );
}
