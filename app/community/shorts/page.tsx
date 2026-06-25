'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { CommunitySectionNav } from '@/components/community/CommunitySectionNav';
import { ShortsViewer } from '@/components/community/ShortsViewer';
import { getCommunityPosts, likeCommunityPost } from '@/lib/user-data';
import { resolvePostKind } from '@/lib/community/filters';
import { useAuth } from '@/components/AuthProvider';
import type { CommunityPost } from '@/lib/types';

export default function CommunityShortsPage() {
  const { user } = useAuth();
  const [shorts, setShorts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await getCommunityPosts('short');
    setShorts(data);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load, user]);

  async function handleLike(id: string) {
    const next = await likeCommunityPost(id);
    setShorts(next.filter((p) => resolvePostKind(p) === 'short'));
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-8">
      <Header />

      <main className="max-w-lg md:max-w-xl mx-auto py-4 space-y-4">
        <div className="flex items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold">Shorts</h1>
            <p className="text-sm text-foreground/60">Vertical videos from the community</p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Link
                href={`/community/u/${user.id}`}
                className="p-2 rounded-lg border border-border hover:bg-card/60 smooth-transition"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
            <Link
              href="/community/create/short"
              className="glass-button px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Link>
          </div>
        </div>

        <CommunitySectionNav />

        {loading ? (
          <div className="glass-card border rounded-xl p-12 text-center text-foreground/60 mx-4">Loading shorts…</div>
        ) : (
          <ShortsViewer
            posts={shorts}
            emptyMessage="No Shorts yet. Tap Create to upload a vertical video, or run the community SQL in Supabase if videos won't save."
            onLike={handleLike}
            onSubscribeChange={load}
          />
        )}
      </main>

      <MobileNav />
    </div>
  );
}
