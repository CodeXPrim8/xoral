'use client';

import { useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/SafeImage';

type StreamVideoProps = {
  src: string;
  poster?: string;
  active?: boolean;
  shouldLoad?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  trimStart?: number;
  trimEnd?: number;
};

/** Mobile-friendly video: lazy src, muted autoplay, poster until ready */
export function StreamVideo({
  src,
  poster,
  active = false,
  shouldLoad = true,
  loop = true,
  muted = true,
  controls = false,
  className = '',
  trimStart = 0,
  trimEnd,
}: StreamVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    if (video.getAttribute('data-src') !== src) {
      video.src = src;
      video.setAttribute('data-src', src);
      video.load();
      setBuffering(true);
    }

    const onCanPlay = () => setBuffering(false);
    const onWaiting = () => setBuffering(true);
    const onTimeUpdate = () => {
      if (trimEnd && video.currentTime >= trimEnd) {
        video.currentTime = trimStart;
      }
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('timeupdate', onTimeUpdate);

    if (active) {
      video.muted = muted;
      if (trimStart > 0 && video.currentTime < trimStart) {
        video.currentTime = trimStart;
      }
      const play = () => {
        void video.play().catch(() => {});
      };
      if (video.readyState >= 3) play();
      else video.addEventListener('canplay', play, { once: true });
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.pause();
    };
  }, [src, active, shouldLoad, muted, trimStart, trimEnd]);

  if (!shouldLoad) {
    if (poster) {
      return (
        <SafeImage
          src={poster}
          alt=""
          fallbackSrc="/placeholder.jpg"
          loading="lazy"
          decoding="async"
          className={className}
        />
      );
    }
    return <div className={`bg-neutral-900 ${className}`} aria-hidden />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {buffering && poster && (
        <SafeImage
          src={poster}
          alt=""
          fallbackSrc="/placeholder.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
      )}
      {buffering && !poster && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
          <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        playsInline
        preload={active ? 'auto' : 'none'}
        loop={loop}
        muted={muted}
        controls={controls}
        poster={poster}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
