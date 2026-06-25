'use client';

import Link from 'next/link';
import { Heart, MessageCircle, Music2, Share2 } from 'lucide-react';
import type { CommunityPost } from '@/lib/types';
import { SafeImage } from '@/components/SafeImage';
import { LazyCommunityMedia } from './LazyCommunityMedia';

export function PostCard({
  post,
  onLike,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
}) {
  const hasMedia = post.mediaType === 'image' || post.mediaType === 'video';

  return (
    <article className="glass-card border rounded-xl overflow-hidden">
      <Link href={post.userId ? `/community/u/${post.userId}` : '#'} className="p-4 flex items-center gap-3 hover:bg-card/40 smooth-transition">
        <SafeImage
          src={post.avatar}
          alt={post.author}
          fallbackSrc="/placeholder-user.jpg"
          className="w-10 h-10 rounded-full object-cover border border-primary/30"
        />
        <div>
          <h3 className="font-bold text-foreground">{post.author}</h3>
          <p className="text-xs text-foreground/50">{post.timestamp}</p>
        </div>
      </Link>

      {hasMedia && (
        <div className="relative aspect-video bg-black max-h-[32rem]">
          <LazyCommunityMedia post={post} />
          {post.musicUrl && (
            <span className="absolute top-3 left-3 flex items-center gap-1 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
              <Music2 className="w-3 h-3" />
              Music
            </span>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {post.content && <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>}

        <div className="flex items-center gap-6 pt-2 border-t border-border/30">
          <button
            type="button"
            onClick={() => onLike(post.id)}
            className="flex items-center gap-2 text-foreground/60 hover:text-accent smooth-transition group"
          >
            <Heart className="w-5 h-5 group-hover:fill-accent" />
            <span className="text-sm">{post.likes}</span>
          </button>
          <button type="button" className="flex items-center gap-2 text-foreground/60 hover:text-accent smooth-transition">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments}</span>
          </button>
          <button type="button" className="flex items-center gap-2 text-foreground/60 hover:text-accent smooth-transition">
            <Share2 className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
