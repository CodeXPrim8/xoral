'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Music2, Share2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { CommunityPost } from '@/lib/types';
import { SafeImage } from '@/components/SafeImage';
import { CommunityMediaPlayer } from './CommunityMediaPlayer';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { isSubscribedTo, requireAuthForAction, toggleSubscribe } from '@/lib/user-data';
import { useAuth } from '@/components/AuthProvider';

const SLIDE_HEIGHT = 'h-[calc(100dvh-10.5rem)] md:h-[calc(100dvh-12rem)]';

function ShortSlide({
  post,
  active,
  shouldLoad,
  onLike,
  onSubscribeChange,
}: {
  post: CommunityPost;
  active: boolean;
  shouldLoad: boolean;
  onLike: (id: string) => void;
  onSubscribeChange: () => void;
}) {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const isSelf = user?.id === post.userId;

  useEffect(() => {
    if (!post.userId || isSelf || !active) return;
    isSubscribedTo(post.userId).then(setSubscribed);
  }, [post.userId, isSelf, active]);

  async function handleSubscribe() {
    if (!post.userId || isSelf) return;
    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction('/community/shorts');
      if (!allowed) {
        toast.info('Sign in to subscribe');
        return;
      }
    }
    const next = await toggleSubscribe(post.userId);
    setSubscribed(next.includes(post.userId));
    onSubscribeChange();
    toast.success(subscribed ? 'Unsubscribed' : 'Subscribed');
  }

  return (
    <section className={`relative ${SLIDE_HEIGHT} w-full snap-start shrink-0 bg-black rounded-xl overflow-hidden`}>
      {post.videoUrl || post.image ? (
        <CommunityMediaPlayer
          post={post}
          active={active}
          shouldLoad={shouldLoad}
          loop
          className="absolute inset-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-white/70">
          <p className="font-semibold text-white mb-2">Video not available</p>
          <p className="text-sm max-w-xs">
            {post.content || 'This Short has no playable media yet. Re-upload from Create Short.'}
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        <button type="button" onClick={() => onLike(post.id)} className="flex flex-col items-center gap-1 text-white">
          <span className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Heart className="w-6 h-6" />
          </span>
          <span className="text-xs font-semibold">{post.likes}</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-white">
          <span className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
            <MessageCircle className="w-6 h-6" />
          </span>
          <span className="text-xs font-semibold">{post.comments}</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-white">
          <span className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Share2 className="w-6 h-6" />
          </span>
          <span className="text-xs font-semibold">Share</span>
        </button>
        {post.musicUrl && (
          <span className="p-2.5 rounded-full bg-black/40 text-white">
            <Music2 className="w-5 h-5" />
          </span>
        )}
        {!isSelf && post.userId && (
          <button type="button" onClick={handleSubscribe} className="flex flex-col items-center gap-1 text-white">
            <span className={`p-2.5 rounded-full backdrop-blur-sm ${subscribed ? 'bg-primary' : 'bg-black/40'}`}>
              <UserPlus className="w-6 h-6" />
            </span>
            <span className="text-xs font-semibold">{subscribed ? 'Subscribed' : 'Subscribe'}</span>
          </button>
        )}
      </div>

      <div className="absolute left-4 right-20 bottom-6 z-10 text-white space-y-2">
        <Link href={post.userId ? `/community/u/${post.userId}` : '#'} className="flex items-center gap-2">
          <SafeImage
            src={post.avatar}
            alt={post.author}
            fallbackSrc="/placeholder-user.jpg"
            className="w-9 h-9 rounded-full object-cover border border-white/30"
            loading="lazy"
            decoding="async"
          />
          <p className="font-bold">@{post.author.replace(/\s+/g, '').toLowerCase()}</p>
        </Link>
        {post.content && <p className="text-sm leading-relaxed line-clamp-3">{post.content}</p>}
      </div>
    </section>
  );
}

export function ShortsViewer({
  posts,
  emptyMessage,
  onLike,
  onSubscribeChange,
}: {
  posts: CommunityPost[];
  emptyMessage: string;
  onLike: (id: string) => void;
  onSubscribeChange: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('[data-short-slide]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = slides.indexOf(entry.target as Element);
            if (index >= 0) setActiveIndex(index);
          }
        }
      },
      { root, threshold: 0.55 }
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <div className="glass-card border rounded-xl p-12 text-center text-foreground/60 min-h-[50vh] flex items-center justify-center mx-4">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${SLIDE_HEIGHT} overflow-y-auto snap-y snap-mandatory scrollbar-hide`}
    >
      {posts.map((post, index) => {
        const distance = Math.abs(index - activeIndex);
        const shouldMount = distance <= 1;

        return (
          <div key={post.id} data-short-slide>
            {shouldMount ? (
              <ShortSlide
                post={post}
                active={index === activeIndex}
                shouldLoad={distance <= 1}
                onLike={onLike}
                onSubscribeChange={onSubscribeChange}
              />
            ) : (
              <div className={`${SLIDE_HEIGHT} w-full snap-start shrink-0 bg-black rounded-xl`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
