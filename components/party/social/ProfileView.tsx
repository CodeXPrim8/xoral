'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Clapperboard,
  Grid3x3,
  Heart,
  MoreHorizontal,
  Repeat2,
  UserSquare2,
} from 'lucide-react';
import type { FeedPostView, PublicUser } from '@/lib/xoral-social/types';

type Highlight = { id: string; title: string; image: string };
type ProfileTab = 'grid' | 'reels' | 'reposts' | 'tagged';

type ProfileData = {
  user: PublicUser;
  posts: FeedPostView[];
  reels: FeedPostView[];
  reposts: FeedPostView[];
  followedByMe: boolean;
  followedBy: PublicUser[];
  highlights: Highlight[];
};

function compactCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? 'X') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function Avatar({ user, size = 40 }: { user: Pick<PublicUser, 'name' | 'image' | 'handle'>; size?: number }) {
  return (
    <span
      className="shrink-0 rounded-full grid place-items-center overflow-hidden bg-gradient-to-br from-[#e8c36a] to-[#ff2d8a] text-black font-bold"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : initials(user.name || user.handle)}
    </span>
  );
}

export function ProfileView({
  userId,
  me,
  onBack,
  onFollow,
  onOpenProfile,
  onLike,
  onRepost,
  requireAuth,
  onLogout,
}: {
  userId: string;
  me: PublicUser | null;
  onBack?: () => void;
  onFollow: (id: string) => void;
  onOpenProfile: (id: string) => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  requireAuth: () => boolean;
  onLogout?: () => void;
}) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<ProfileTab>('grid');
  const [open, setOpen] = useState<FeedPostView | null>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let live = true;
    setData(null);
    setError('');
    setTab('grid');
    setOpen(null);
    void fetch(`/api/xoral/profile?id=${encodeURIComponent(userId)}`, { credentials: 'include' })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Profile not found.');
        return body as ProfileData;
      })
      .then((next) => {
        if (!live) return;
        setData(next);
        setFollowing(next.followedByMe);
      })
      .catch((err) => {
        if (!live) return;
        setError(err instanceof Error ? err.message : 'Could not open profile.');
      });
    return () => {
      live = false;
    };
  }, [userId]);

  if (error) {
    return (
      <div className="ig-profile">
        {onBack && (
          <button type="button" className="ig-profile-back" onClick={onBack}>
            <ChevronLeft className="w-6 h-6" /> Back
          </button>
        )}
        <p className="ig-empty">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ig-profile">
        <p className="ig-empty">Opening profile…</p>
      </div>
    );
  }

  const user = data.user;
  const mine = me?.id === user.id;
  const grid = tab === 'grid' ? data.posts : tab === 'reels' ? data.reels : tab === 'reposts' ? data.reposts : [];
  const names = data.followedBy.map((p) => p.handle).join(' and ');

  function follow() {
    if (!requireAuth()) return;
    setFollowing((v) => !v);
    onFollow(user.id);
  }

  return (
    <div className="ig-profile">
      <div className="ig-profile-nav">
        {onBack ? (
          <button type="button" className="ig-icon-btn" onClick={onBack} aria-label="Back">
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : (
          <span className="ig-icon-btn" />
        )}
        <p className="ig-profile-handle">{user.handle}</p>
        <button type="button" className="ig-icon-btn" aria-label="More">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="ig-profile-head">
        <span className="ig-profile-ring">
          <Avatar user={user} size={86} />
        </span>
        <div className="ig-profile-stats">
          <p className="ig-profile-name">{user.name}</p>
          <div className="ig-profile-counts">
            <span><b>{compactCount(user.audiencePosts)}</b> posts</span>
            <span><b>{compactCount(user.audienceFollowers)}</b> followers</span>
            <span><b>{compactCount(user.audienceFollowing)}</b> following</span>
          </div>
        </div>
      </div>

      <div className="ig-profile-bio">
        <p className="ig-profile-role">{user.role}</p>
        <p>{user.bio}</p>
        <p>{user.city}{user.world === 'xoral' ? ' · Xoral universe' : ' · Real world'}</p>
        {user.link && <p className="ig-profile-link">{user.link}</p>}
      </div>

      {data.followedBy.length > 0 && (
        <p className="ig-profile-proof">
          Followed by {names}
        </p>
      )}

      <div className="ig-profile-actions">
        {mine ? (
          <>
            <button type="button" className="ig-profile-btn">Edit profile</button>
            {onLogout && <button type="button" className="ig-profile-btn" onClick={onLogout}>Log out</button>}
          </>
        ) : (
          <>
            <button type="button" className={`ig-profile-btn ${following ? '' : 'ig-profile-btn-on'}`} onClick={follow}>
              {following ? 'Following' : 'Follow'}
            </button>
            <button type="button" className="ig-profile-btn">Message</button>
          </>
        )}
      </div>

      {data.highlights.length > 0 && (
        <div className="ig-highlights">
          {data.highlights.map((h) => (
            <div key={h.id} className="ig-highlight">
              <span><img src={h.image} alt="" /></span>
              <em>{h.title}</em>
            </div>
          ))}
        </div>
      )}

      <div className="ig-profile-tabs">
        {([
          ['grid', Grid3x3],
          ['reels', Clapperboard],
          ['reposts', Repeat2],
          ['tagged', UserSquare2],
        ] as const).map(([id, Icon]) => (
          <button key={id} type="button" className={tab === id ? 'on' : ''} onClick={() => setTab(id)} aria-label={id}>
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {tab === 'tagged' && <p className="ig-empty">No tagged posts yet.</p>}
      {tab !== 'tagged' && grid.length === 0 && <p className="ig-empty">No posts yet.</p>}
      <div className="ig-grid">
        {grid.map((post) => (
          <button key={post.id} type="button" className="ig-grid-cell" onClick={() => setOpen(post)}>
            {post.image && <img src={post.image} alt="" />}
            {post.kind === 'reel' && <i className="ig-grid-play" />}
          </button>
        ))}
      </div>

      {open && (
        <div className="ig-sheet">
          <button type="button" className="ig-sheet-bg" onClick={() => setOpen(null)} aria-label="Close post" />
          <div className="ig-sheet-card ig-profile-post">
            <div className="ig-sheet-handle" />
            <div className="ig-post-head">
              <button type="button" className="ig-user-hit" onClick={() => { setOpen(null); onOpenProfile(open.author.id); }}>
                <Avatar user={open.author} size={36} />
                <span>{open.author.handle}</span>
              </button>
            </div>
            {open.image && <img src={open.image} alt="" className="ig-profile-post-img" />}
            <p className="ig-profile-post-body">{open.body}</p>
            <div className="ig-post-actions">
              <div className="ig-post-actions-left">
                <button type="button" className={open.likedByMe ? 'on' : ''} onClick={() => { requireAuth(); onLike(open.id); setOpen({ ...open, likedByMe: !open.likedByMe, likes: open.likes + (open.likedByMe ? -1 : 1) }); }}>
                  <Heart className={`w-6 h-6 ${open.likedByMe ? 'fill-current' : ''}`} />
                  <span>{compactCount(open.likes)}</span>
                </button>
                <button type="button" className={open.repostedByMe ? 'on' : ''} onClick={() => { requireAuth(); onRepost(open.id); setOpen({ ...open, repostedByMe: !open.repostedByMe, reposts: (open.reposts ?? 0) + (open.repostedByMe ? -1 : 1) }); }}>
                  <Repeat2 className="w-6 h-6" />
                  <span>{compactCount(open.reposts ?? 0)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
