'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Info, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { titlePath, watchPath } from '@/lib/cms/paths';
import { SafeImage } from './SafeImage';
import { getPlaybackPosition, getResumeSeconds, savePlaybackPosition } from '@/lib/playback-progress';

const IMAGE_PHASE_MS_DESKTOP = 2000;
const IMAGE_PHASE_MS_MOBILE = 700;

export interface HeroBannerProps {
  slug: string;
  title: string;
  description: string;
  rating: number;
  category: string;
  image: string;
  subtitle?: string;
  videoUrl?: string;
  trailerUrl?: string;
  watchProgressPercent?: number;
  onPlaybackChange?: (playing: boolean) => void;
}

export function HeroBanner({
  slug,
  title,
  description,
  rating,
  image,
  subtitle,
  videoUrl,
  trailerUrl,
  watchProgressPercent = 0,
  onPlaybackChange,
}: HeroBannerProps) {
  const previewSrc = trailerUrl || videoUrl;
  const playSrc = videoUrl || trailerUrl;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showImage, setShowImage] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoPreview, setAutoPreview] = useState(true);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    setIsMobile(mobile);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setAutoPreview(!mobile && !conn?.saveData);
  }, []);

  useEffect(() => {
    setHasSavedProgress(getPlaybackPosition(slug) > 1 || watchProgressPercent > 0);
  }, [slug, watchProgressPercent]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewSrc) return;
    video.preload = 'auto';
    if (!video.src.endsWith(previewSrc)) {
      video.src = previewSrc;
      video.load();
    }
  }, [previewSrc]);

  useEffect(() => {
    if (!previewSrc || !autoPreview) return;
    const delay = isMobile ? IMAGE_PHASE_MS_MOBILE : IMAGE_PHASE_MS_DESKTOP;
    const timer = window.setTimeout(() => setShowImage(false), delay);
    return () => window.clearTimeout(timer);
  }, [previewSrc, isMobile, autoPreview]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewSrc || showImage || isPlaying || !autoPreview) return;

    video.muted = true;
    video.loop = true;
    video.controls = false;
    if (!video.src.endsWith(previewSrc)) {
      video.src = previewSrc;
    }
    void video.play().catch(() => {});
  }, [previewSrc, showImage, isPlaying, autoPreview]);

  const persistProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    savePlaybackPosition(slug, video.currentTime);
    setHasSavedProgress(video.currentTime > 1);
  }, [slug]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const onTimeUpdate = () => persistProgress();
    const onPause = () => persistProgress();

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
    };
  }, [isPlaying, persistProgress]);

  async function startPlayback() {
    if (!playSrc) return;

    const video = videoRef.current;
    if (!video) return;

    setShowImage(false);
    setIsPlaying(true);
    setIsMuted(false);
    onPlaybackChange?.(true);

    if (!video.src.endsWith(playSrc)) {
      video.src = playSrc;
    }

    video.loop = false;
    video.controls = true;
    video.muted = false;

    const applyResume = () => {
      const resumeAt = getResumeSeconds(slug, video.duration, watchProgressPercent);
      if (resumeAt > 0) {
        video.currentTime = resumeAt;
      }
    };

    if (video.readyState >= 1) {
      applyResume();
    } else {
      video.addEventListener('loadedmetadata', applyResume, { once: true });
    }

    try {
      await video.play();
    } catch {
      video.muted = true;
      setIsMuted(true);
      await video.play().catch(() => {});
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
  }

  const hasVideo = Boolean(previewSrc);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[100vh] md:h-[70vh] flex items-center">
        <div className="absolute inset-0">
          {hasVideo ? (
            <button
              type="button"
              onClick={() => {
                if (!isPlaying) void startPlayback();
              }}
              className="absolute inset-0 w-full h-full cursor-pointer group"
              aria-label={isPlaying ? 'Hero video playing' : `Play ${title}`}
            >
              <video
                ref={videoRef}
                playsInline
                preload="auto"
                poster={image}
                muted
                className={`w-full h-full object-cover smooth-transition ${
                  showImage && !isPlaying ? 'opacity-0' : 'opacity-100'
                }`}
              />
              {showImage && !isPlaying && (
                <SafeImage
                  src={image}
                  alt={title}
                  fallbackSrc="/posters/xoral-hero.svg"
                  loading="eager"
                  fetchPriority="high"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {hasVideo && !isPlaying && !showImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 smooth-transition">
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/90 text-background">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </span>
                </div>
              )}
            </button>
          ) : (
            <SafeImage
              src={image}
              alt={title}
              fallbackSrc="/posters/xoral-hero.svg"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/70 via-40% to-transparent to-100% pointer-events-none" />
        </div>

        {isPlaying && (
          <div className="absolute top-20 right-4 z-20 flex gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-background/60 border border-border hover:bg-background/80 smooth-transition"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                videoRef.current?.pause();
                setIsPlaying(false);
                setIsMuted(true);
                onPlaybackChange?.(false);
                persistProgress();
              }}
              className="p-2 rounded-full bg-background/60 border border-border hover:bg-background/80 smooth-transition"
              aria-label="Pause hero video"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="relative w-full h-full flex items-center pointer-events-none">
          <div className="xoral-page w-full flex flex-col justify-center space-y-3 md:space-y-6 py-12 md:py-0 md:max-w-[55%] lg:max-w-[50%] xl:max-w-[45%] pointer-events-auto">
            {subtitle && (
              <p className="text-base md:text-lg font-semibold text-foreground">{subtitle}</p>
            )}

            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight"
              style={{ color: '#F4D03F' }}
            >
              {title}
            </h1>

            <p className="text-sm md:text-base text-foreground leading-relaxed max-w-xl line-clamp-4">
              {description}
            </p>

            <div className="flex items-center gap-3 pt-4 md:pt-6 flex-wrap">
              {hasVideo ? (
                <button
                  type="button"
                  onClick={() => void startPlayback()}
                  className="flex items-center justify-center gap-2 bg-white text-background px-8 md:px-10 py-2.5 md:py-3 rounded text-sm md:text-base font-bold hover:bg-white/80 smooth-transition"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {hasSavedProgress ? 'Resume' : 'Play'}
                </button>
              ) : (
                <Link
                  href={watchPath(slug)}
                  className="flex items-center justify-center gap-2 bg-white text-background px-8 md:px-10 py-2.5 md:py-3 rounded text-sm md:text-base font-bold hover:bg-white/80 smooth-transition"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Play
                </Link>
              )}
              <Link
                href={titlePath(slug)}
                className="flex items-center justify-center gap-2 bg-foreground/40 hover:bg-foreground/50 text-foreground px-8 md:px-10 py-2.5 md:py-3 rounded text-sm md:text-base font-bold smooth-transition"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
              {hasVideo && (
                <Link
                  href={watchPath(slug)}
                  className="text-sm font-semibold text-foreground/70 hover:text-foreground underline-offset-4 hover:underline smooth-transition"
                >
                  Full screen
                </Link>
              )}
            </div>
          </div>

          <div className="absolute bottom-8 md:bottom-12 right-[clamp(1rem,4vw,3.5rem)] text-foreground font-bold text-2xl md:text-3xl border-2 border-foreground px-4 md:px-5 py-2 md:py-3 pointer-events-none">
            {rating}+
          </div>
        </div>
      </div>
    </section>
  );
}
