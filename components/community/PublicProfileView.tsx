'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Film, PlaySquare, Settings, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { CommunityPost, PublicProfile } from '@/lib/types';
import { SafeImage } from '@/components/SafeImage';
import { PostCard } from './PostCard';
import { ShortsViewer } from './ShortsViewer';
import {
  getUserCommunityPosts,
  isSubscribedTo,
  requireAuthForAction,
  toggleSubscribe,
} from '@/lib/user-data';
import { useAuth } from '@/components/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export function PublicProfileView({
  profile,
  isOwner,
}: {
  profile: PublicProfile;
  isOwner: boolean;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'posts' | 'shorts'>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [shorts, setShorts] = useState<CommunityPost[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [userPosts, userShorts] = await Promise.all([
        getUserCommunityPosts(profile.id, 'post'),
        getUserCommunityPosts(profile.id, 'short'),
      ]);
      setPosts(userPosts);
      setShorts(userShorts);
      if (user?.id && user.id !== profile.id) {
        setSubscribed(await isSubscribedTo(profile.id));
      }
      setLoading(false);
    }
    load();
  }, [profile.id, user?.id]);

  async function handleSubscribe() {
    if (isSupabaseConfigured()) {
      const allowed = await requireAuthForAction(`/community/u/${profile.id}`);
      if (!allowed) {
        toast.info('Sign in to subscribe');
        return;
      }
    }
    await toggleSubscribe(profile.id);
    setSubscribed((value) => !value);
    toast.success(subscribed ? 'Unsubscribed' : 'Subscribed');
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden glass-card border">
        <div
          className="h-32 md:h-40 bg-gradient-to-r from-primary/40 to-secondary/30"
          style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover' } : undefined}
        />
        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
          <SafeImage
            src={profile.avatarUrl}
            alt={profile.displayName}
            fallbackSrc="/placeholder-user.jpg"
            className="w-24 h-24 rounded-full object-cover border-4 border-background"
          />
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-black">{profile.displayName}</h1>
            {profile.bio && <p className="text-foreground/70 text-sm max-w-xl">{profile.bio}</p>}
            <p className="text-sm text-foreground/50">
              <strong className="text-foreground">{profile.subscriberCount}</strong> subscribers ·{' '}
              {profile.postCount} posts · {profile.shortCount} shorts
            </p>
          </div>
          <div className="flex gap-2">
            {isOwner ? (
              <Link
                href="/community/settings"
                className="glass-button px-5 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit profile
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSubscribe}
                className="glass-button px-5 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/40">
        {[
          { id: 'posts' as const, label: 'Posts', icon: Film, count: profile.postCount },
          { id: 'shorts' as const, label: 'Shorts', icon: PlaySquare, count: profile.shortCount },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 smooth-transition ${
              tab === id ? 'border-primary text-foreground' : 'border-transparent text-foreground/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-foreground/60 py-12">Loading…</p>
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <p className="text-center text-foreground/60 py-12">No posts yet.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={() => {}} />
            ))}
          </div>
        )
      ) : shorts.length === 0 ? (
        <p className="text-center text-foreground/60 py-12">No shorts yet.</p>
      ) : (
        <ShortsViewer
          posts={shorts}
          emptyMessage="No shorts"
          onLike={() => {}}
          onSubscribeChange={() => {}}
        />
      )}
    </div>
  );
}
