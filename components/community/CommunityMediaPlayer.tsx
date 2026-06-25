'use client';

import { useEffect, useRef } from 'react';
import type { CommunityPost } from '@/lib/types';
import { SafeImage } from '@/components/SafeImage';
import { StreamVideo } from '@/components/media/StreamVideo';

type CommunityMediaPlayerProps = {
  post: CommunityPost;
  active?: boolean;
  shouldLoad?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
};

/** Plays optional background music with image or trimmed video */
export function CommunityMediaPlayer({
  post,
  active: activeProp,
  shouldLoad: shouldLoadProp,
  autoPlay = false,
  loop = true,
  className = '',
}: CommunityMediaPlayerProps) {
  const active = activeProp ?? autoPlay;
  const shouldLoad = shouldLoadProp ?? true;
  const audioRef = useRef<HTMLAudioElement>(null);
  const poster = post.image || undefined;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !post.musicUrl || !shouldLoad) return;

    if (active) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [post.musicUrl, active, shouldLoad]);

  return (
    <div className={`relative ${className}`}>
      {post.mediaType === 'video' && post.videoUrl && (
        <StreamVideo
          src={post.videoUrl}
          poster={poster}
          active={active}
          shouldLoad={shouldLoad}
          loop={loop}
          muted
          className="absolute inset-0 w-full h-full"
          trimStart={post.videoTrimStart ?? 0}
          trimEnd={post.videoTrimEnd}
        />
      )}
      {post.mediaType === 'image' && post.image && (
        <SafeImage
          src={post.image}
          alt={post.content || 'Post'}
          loading="lazy"
          decoding="async"
          fallbackSrc="/placeholder.jpg"
          className="w-full h-full object-cover"
        />
      )}
      {post.musicUrl && shouldLoad && (
        <audio ref={audioRef} src={post.musicUrl} loop={loop} preload="none" className="hidden" />
      )}
    </div>
  );
}
