'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { CommunitySectionNav } from '@/components/community/CommunitySectionNav';
import { PostCard } from '@/components/community/PostCard';
import { getCommunityPosts, likeCommunityPost } from '@/lib/user-data';
import { useAuth } from '@/components/AuthProvider';
import type { CommunityPost } from '@/lib/types';

export default function CommunityPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getCommunityPosts('post');
      setPosts(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load posts');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load, user]);

  async function handleLike(id: string) {
    const next = await likeCommunityPost(id);
    setPosts(next.filter((p) => p.postKind === 'post'));
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="xoral-page-narrow py-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-2xl font-bold">Post</h1>
            <p className="text-sm text-foreground/60">Share updates, photos, and videos</p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Link
                href={`/community/u/${user.id}`}
                className="p-2 rounded-lg border border-border hover:bg-card/60 smooth-transition"
                title="Your profile"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            <Link
              href="/community/create/post"
              className="glass-button px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Link>
          </div>
        </div>

        <CommunitySectionNav />

        {loading ? (
          <div className="glass-card border rounded-xl p-12 text-center text-foreground/60">Loading posts…</div>
        ) : loadError ? (
          <div className="glass-card border rounded-xl p-12 text-center text-foreground/60 space-y-3">
            <p>{loadError}</p>
            <button type="button" onClick={load} className="glass-button px-4 py-2 rounded-lg text-sm font-semibold">
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card border rounded-xl p-12 text-center text-foreground/60 space-y-4">
            <p>No posts yet. Create a post or check your profile.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/community/create/post" className="glass-button inline-flex px-6 py-2 rounded-lg font-semibold">
                Create Post
              </Link>
              {user && (
                <Link
                  href={`/community/u/${user.id}`}
                  className="glass-card border inline-flex px-6 py-2 rounded-lg font-semibold hover:bg-card/60"
                >
                  My profile
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
