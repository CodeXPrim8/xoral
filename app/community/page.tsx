'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { communityPosts as seedPosts } from '@/lib/data';
import {
  addCommunityPost,
  getCommunityPosts,
  likeCommunityPost,
  requireAuthForAction,
} from '@/lib/user-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { CommunityPost } from '@/lib/types';
import { SafeImage } from '@/components/SafeImage';

export default function CommunityPage() {
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    getCommunityPosts().then((stored) => setPosts([...stored, ...seedPosts]));
  }, []);

  async function handleShare() {
    if (!draft.trim()) return;
    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction('/community');
      if (!allowed) {
        toast.info('Sign in to post on the XORAL community');
        return;
      }
    }
    const next = await addCommunityPost(draft.trim());
    setPosts([...next, ...seedPosts]);
    setDraft('');
    toast.success('Post shared');
  }

  async function handleLike(id: string) {
    if (id.startsWith('local-') || !id.match(/^[0-9a-f-]{36}$/i)) {
      if (id.startsWith('local-')) {
        const next = await likeCommunityPost(id);
        setPosts([...next, ...seedPosts]);
      } else {
        setPosts((current) =>
          current.map((post) => (post.id === id ? { ...post, likes: post.likes + 1 } : post))
        );
      }
      return;
    }
    const next = await likeCommunityPost(id);
    setPosts([...next, ...seedPosts]);
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Community Feed</h1>
          <p className="text-foreground/60">Connect with other XORAL enthusiasts</p>
        </div>

        <div className="glass-card border rounded-xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <textarea
                placeholder="What are you watching today?"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="w-full bg-card/40 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-card/60 smooth-transition resize-none"
                rows={3}
              />
              <button
                type="button"
                onClick={handleShare}
                className="glass-button px-6 py-2 rounded-lg font-semibold"
              >
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="glass-card border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <SafeImage
                  src={post.avatar}
                  alt={post.author}
                  fallbackSrc="/placeholder-user.jpg"
                  className="w-12 h-12 rounded-full object-cover border border-primary/30"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{post.author}</h3>
                  <p className="text-sm text-foreground/50">{post.timestamp}</p>
                </div>
              </div>

              <p className="text-foreground/90">{post.content}</p>

              {post.image && (
                <SafeImage
                  src={post.image}
                  alt="Post content"
                  fallbackSrc="/placeholder.jpg"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
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
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
