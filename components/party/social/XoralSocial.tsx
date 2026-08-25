'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Clapperboard,
  Heart,
  Home,
  ImagePlus,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Repeat2,
  Radio,
  Send,
  User as UserIcon,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { FeedPostView, PublicUser, SocialNotification } from '@/lib/xoral-social/types';
import { ClemxPhone } from '@/components/party/phone/ClemxPhone';
import { ProfileView } from '@/components/party/social/ProfileView';
import { compressImage, readPhotos, takeXoralShare } from '@/lib/clemx/library';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? 'X') + (parts[1]?.[0] ?? '')).toUpperCase();
}

type StoryView = {
  id: string;
  authorId: string;
  image: string;
  body?: string;
  createdAt: number;
  author: PublicUser;
};

type Tab = 'feed' | 'reels' | 'live' | 'profile';

function compactCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function ReelsFeed({
  posts,
  now,
  me,
  onLike,
  onComment,
  onReply,
  onLikeComment,
  onRepost,
  onOpenProfile,
  requireAuth,
}: {
  posts: FeedPostView[];
  now: number;
  me: PublicUser | null;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onReply: (commentId: string, text: string) => void;
  onLikeComment: (id: string) => void;
  onRepost: (id: string) => void;
  onOpenProfile: (id: string) => void;
  requireAuth: () => boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(posts[0]?.id ?? '');
  const lastTap = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const videos = [...root.querySelectorAll('video')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            void video.play().catch(() => undefined);
            const id = video.dataset.reelId;
            if (id) setActiveId(id);
          } else {
            video.pause();
          }
        }
      },
      { root, threshold: [0.65] },
    );
    videos.forEach((video) => io.observe(video));
    return () => io.disconnect();
  }, [posts]);

  useEffect(() => {
    const post = posts.find((p) => p.id === activeId);
    const el = audioRef.current;
    if (!el || !post?.audio) return;
    if (!el.src.endsWith(post.audio) && el.src !== post.audio) {
      el.src = post.audio;
    }
    el.loop = true;
    el.muted = muted;
    if (muted) {
      el.pause();
      return;
    }
    void el.play().catch(() => setMuted(true));
  }, [activeId, muted, posts]);

  function enableSound() {
    setMuted(false);
    const el = audioRef.current;
    const post = posts.find((p) => p.id === activeId);
    if (!el || !post?.audio) return;
    el.src = post.audio;
    el.loop = true;
    el.muted = false;
    void el.play().catch(() => undefined);
  }

  function tapVideo(post: FeedPostView) {
    const t = Date.now();
    if (t - lastTap.current < 320) {
      if (!post.likedByMe) onLike(post.id);
    } else if (muted) {
      enableSound();
    } else {
      setMuted(true);
    }
    lastTap.current = t;
  }

  const open = posts.find((p) => p.id === openId) ?? null;

  return (
    <>
      <audio ref={audioRef} preload="auto" />
      <div ref={rootRef} className="xp-reels">
        {posts.map((post) => (
          <article key={post.id} className="xp-reel">
            <button type="button" className="xp-reel-stage" onClick={() => tapVideo(post)} aria-label="Play reel. Tap for sound. Double tap to like.">
              {post.video ? (
                <video
                  data-reel-id={post.id}
                  src={post.video}
                  poster={post.image}
                  playsInline
                  muted
                  loop
                  preload="auto"
                />
              ) : (
                post.image && <img src={post.image} alt="" />
              )}
            </button>
            <div className="xp-reel-shade" />
            {muted && (
              <button type="button" className="xp-reel-sound-hint" onClick={enableSound}>
                Tap for sound
              </button>
            )}
            <button type="button" className="xp-reel-mute" onClick={() => (muted ? enableSound() : setMuted(true))} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="xp-reel-meta">
              <button type="button" className="font-semibold text-left" onClick={() => onOpenProfile(post.author.id)}>@{post.author.handle}</button>
              <p className="text-sm text-white/85 mt-1 line-clamp-3">{post.body}</p>
              <p className="xp-reel-track">
                <Music2 className="w-3.5 h-3.5" />
                <span>Original sound · {post.author.name}</span>
              </p>
            </div>
            <div className="xp-reel-rail">
              <button type="button" className="xp-reel-avatar" onClick={() => onOpenProfile(post.author.id)} aria-label={`${post.author.handle} profile`}>
                <Avatar user={post.author} size={44} />
              </button>
              <button type="button" onClick={() => onLike(post.id)} className={post.likedByMe ? 'on' : ''}>
                <Heart className={`w-8 h-8 ${post.likedByMe ? 'fill-current' : ''}`} />
                <em>{compactCount(post.likes)}</em>
              </button>
              <button type="button" onClick={() => setOpenId(post.id)}>
                <MessageCircle className="w-8 h-8" />
                <em>{compactCount(post.commentsCount)}</em>
              </button>
              <button type="button" onClick={() => onRepost(post.id)} className={post.repostedByMe ? 'on' : ''}>
                <Repeat2 className="w-8 h-8" />
                <em>{compactCount(post.reposts ?? 0)}</em>
              </button>
            </div>
          </article>
        ))}
      </div>
      {open && (
        <CommentsSheet
          post={open}
          now={now}
          me={me}
          onClose={() => setOpenId(null)}
          onComment={(text) => onComment(open.id, text)}
          onReply={onReply}
          onLikeComment={onLikeComment}
          onOpenProfile={onOpenProfile}
          requireAuth={requireAuth}
        />
      )}
    </>
  );
}

function timeAgo(ts: number, now: number) {
  if (!now) return '';
  const mins = Math.floor(Math.max(0, now - ts) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function Avatar({ user, size = 40 }: { user: Pick<PublicUser, 'name' | 'image' | 'handle'>; size?: number }) {
  const letters = initials(user.name || user.handle);
  return (
    <span
      className="shrink-0 rounded-full grid place-items-center overflow-hidden bg-gradient-to-br from-[#e8c36a] to-[#ff2d8a] text-black font-bold"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : letters}
    </span>
  );
}

function Ring({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className={`rounded-full p-[2px] ${active ? 'bg-gradient-to-tr from-[#e8c36a] via-[#ff2d8a] to-[#7a3cff]' : 'bg-white/15'}`}>
      <span className="block rounded-full bg-[#0b0712] p-[2px]">{children}</span>
    </span>
  );
}

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const QUICK_EMOJIS = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];

function CommentsSheet({
  post,
  now,
  me,
  onClose,
  onComment,
  onReply,
  onLikeComment,
  onOpenProfile,
  requireAuth,
}: {
  post: FeedPostView;
  now: number;
  me: PublicUser | null;
  onClose: () => void;
  onComment: (text: string) => void;
  onReply: (commentId: string, text: string) => void;
  onLikeComment: (id: string) => void;
  onOpenProfile: (id: string) => void;
  requireAuth: () => boolean;
}) {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function send(e?: FormEvent) {
    e?.preventDefault();
    const next = text.trim();
    if (!next) return;
    if (!requireAuth()) return;
    if (replyTo) onReply(replyTo.id, next);
    else onComment(next);
    setText('');
    setReplyTo(null);
  }

  function startReply(id: string, name: string) {
    setReplyTo({ id, name });
    setText(`@${name} `);
    inputRef.current?.focus();
  }

  return (
    <div className="ig-sheet">
      <button type="button" className="ig-sheet-bg" onClick={onClose} aria-label="Close comments" />
      <div className="ig-sheet-card" role="dialog" aria-label="Comments">
        <div className="ig-sheet-handle" />
        <div className="ig-sheet-head">
          <span className="ig-sheet-spacer" />
          <h3>Comments</h3>
          <button type="button" className="ig-icon-btn" aria-label="Share">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="ig-sheet-list">
          {post.comments.length === 0 && <p className="ig-empty">No comments yet.</p>}
          {post.comments.map((comment) => (
            <div key={comment.id} className="ig-cmt">
              <button type="button" onClick={() => onOpenProfile(comment.author.id)} aria-label={`${comment.author.handle} profile`}>
                <Avatar user={comment.author} size={36} />
              </button>
              <div className="ig-cmt-body">
                <p className="ig-cmt-meta">
                  <strong>{comment.author.handle}</strong>
                  <span>· {timeAgo(comment.createdAt, now)}</span>
                  {comment.author.id === post.author.id && <em>Author</em>}
                </p>
                <p className="ig-cmt-text">{comment.body}</p>
                <button type="button" className="ig-cmt-reply" onClick={() => startReply(comment.id, comment.author.handle)}>Reply</button>
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="ig-cmt ig-cmt-nested">
                    <button type="button" onClick={() => onOpenProfile(reply.author.id)} aria-label={`${reply.author.handle} profile`}>
                      <Avatar user={reply.author} size={24} />
                    </button>
                    <div className="ig-cmt-body">
                      <p className="ig-cmt-meta">
                        <strong>{reply.author.handle}</strong>
                        <span>· {timeAgo(reply.createdAt, now)}</span>
                      </p>
                      <p className="ig-cmt-text">{reply.body}</p>
                    </div>
                  </div>
                ))}
                {comment.typingName && <p className="ig-typing">{comment.typingName} is typing…</p>}
              </div>
              <button
                type="button"
                className={`ig-cmt-heart ${comment.likedByMe ? 'on' : ''}`}
                onClick={() => requireAuth() && onLikeComment(comment.id)}
                aria-label="Like comment"
              >
                <Heart className={`w-3.5 h-3.5 ${comment.likedByMe ? 'fill-current' : ''}`} />
                {comment.likes > 0 && <span>{comment.likes}</span>}
              </button>
            </div>
          ))}
        </div>
        <div className="ig-sheet-compose">
          <div className="ig-emojis">
            {QUICK_EMOJIS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => setText((t) => t + emoji)}>{emoji}</button>
            ))}
          </div>
          <form className="ig-compose-row" onSubmit={send}>
            {me ? <Avatar user={me} size={32} /> : <span className="ig-compose-dot" />}
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo.name}...` : `Add a comment for ${post.author.handle}...`}
              maxLength={280}
            />
            {text.trim() ? (
              <button type="submit">Post</button>
            ) : (
              <button type="submit" disabled>Post</button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  now,
  me,
  onLike,
  onComment,
  onReply,
  onLikeComment,
  onRepost,
  onOpenProfile,
  requireAuth,
}: {
  post: FeedPostView;
  now: number;
  me: PublicUser | null;
  onLike: () => void;
  onComment: (text: string) => void;
  onReply: (commentId: string, text: string) => void;
  onLikeComment: (id: string) => void;
  onRepost: () => void;
  onOpenProfile: (id: string) => void;
  requireAuth: () => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(false);
  const lastTap = useRef(0);
  const caption = post.body.replace(/(?:^|\s)#[A-Za-z0-9_]+/g, ' ').trim();
  const preview = post.comments[0];

  function doubleTap() {
    const t = Date.now();
    if (t - lastTap.current < 320) {
      if (!post.likedByMe) onLike();
      setBurst(true);
      window.setTimeout(() => setBurst(false), 700);
    }
    lastTap.current = t;
  }

  return (
    <article className="ig-post">
      <div className="ig-post-head">
        <button type="button" className="ig-user-hit" onClick={() => onOpenProfile(post.author.id)}>
          <Avatar user={post.author} size={36} />
          <div className="min-w-0 text-left">
            <p className="ig-post-user">{post.author.handle}</p>
            <p className="ig-post-music"><Music2 className="w-3 h-3" /> Original sound · {post.author.name}</p>
          </div>
        </button>
        <button type="button" className="ig-icon-btn" aria-label="More">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      {post.image && (
        <div className="ig-post-media">
          <button type="button" onClick={doubleTap} className="ig-post-photo" aria-label="Double tap to like">
            <img src={post.image} alt="" decoding="async" loading="lazy" />
          </button>
          {burst && (
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <Heart className="w-20 h-20 text-white fill-white animate-pulse" />
            </span>
          )}
        </div>
      )}
      <div className="ig-post-actions">
        <div className="ig-post-actions-left">
          <button type="button" onClick={onLike} className={post.likedByMe ? 'on' : ''}>
            <Heart className={`w-[26px] h-[26px] ${post.likedByMe ? 'fill-current' : ''}`} />
            <span>{compactCount(post.likes)}</span>
          </button>
          <button type="button" onClick={() => setOpen(true)}>
            <MessageCircle className={`w-[26px] h-[26px]`} />
            <span>{compactCount(post.commentsCount)}</span>
          </button>
          <button type="button" onClick={onRepost} className={post.repostedByMe ? 'on' : ''}>
            <Repeat2 className="w-[26px] h-[26px]" />
            <span>{compactCount(post.reposts ?? 0)}</span>
          </button>
          <button
            type="button"
            aria-label="Share"
            onClick={() => {
              const text = `Check @${post.author.handle} on Xoral`;
              if (navigator.share) void navigator.share({ text }).catch(() => undefined);
              else void navigator.clipboard?.writeText(text).catch(() => undefined);
            }}
          >
            <Send className="w-[24px] h-[24px]" />
          </button>
        </div>
        <button type="button" onClick={() => setSaved((v) => !v)} className={saved ? 'on' : ''} aria-label="Save">
          <Bookmark className={`w-[24px] h-[24px] ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="ig-post-copy">
        <p><strong>{post.author.handle}</strong> {caption}</p>
        {preview && (
          <p className="ig-post-preview">
            <strong>{preview.author.handle}</strong> {preview.body}
          </p>
        )}
        <button type="button" className="ig-post-time" onClick={() => setOpen(true)}>
          {timeAgo(post.createdAt, now)} ago
        </button>
      </div>
      {open && (
        <CommentsSheet
          post={post}
          now={now}
          me={me}
          onClose={() => setOpen(false)}
          onComment={onComment}
          onReply={onReply}
          onLikeComment={onLikeComment}
          onOpenProfile={onOpenProfile}
          requireAuth={requireAuth}
        />
      )}
    </article>
  );
}

function AuthSheet({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/api/xoral/auth', {
        method: 'POST',
        body: JSON.stringify({ action: mode, name, handle, password, gender }),
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue');
    }
  }

  return (
    <div className="ig-sheet">
      <button type="button" className="ig-sheet-bg" onClick={onClose} aria-label="Close" />
      <form onSubmit={submit} className="ig-sheet-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="xp-display text-2xl">{mode === 'login' ? 'Welcome back' : 'Join Xoral'}</h3>
          <button type="button" onClick={onClose} className="h-10 w-10 grid place-items-center"><X className="w-4 h-4" /></button>
        </div>
        <p className="mt-2 text-sm text-white/55">Your account lives on Xoral — not on anyone else’s servers.</p>
        {mode === 'register' && (
          <>
            <input className="xp-field mt-4" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setGender('female')} className={`xp-btn ${gender === 'female' ? 'xp-btn-primary' : 'xp-btn-ghost'} !text-xs`}>Girl</button>
              <button type="button" onClick={() => setGender('male')} className={`xp-btn ${gender === 'male' ? 'xp-btn-primary' : 'xp-btn-ghost'} !text-xs`}>Guy</button>
            </div>
          </>
        )}
        <input className="xp-field mt-3" placeholder="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} required />
        <input className="xp-field mt-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p className="mt-3 text-sm text-[#ff7aa8]">{error}</p>}
        <button type="submit" className="xp-btn xp-btn-primary mt-4 w-full">{mode === 'login' ? 'Log in' : 'Create Xoral account'}</button>
        <button type="button" className="mt-3 text-sm text-white/50 w-full" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Join Xoral' : 'Already in? Log in'}
        </button>
      </form>
    </div>
  );
}

export function XoralSocial({ standalone = false }: { standalone?: boolean }) {
  const [tab, setTab] = useState<Tab>('feed');
  const [me, setMe] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<FeedPostView[]>([]);
  const [reels, setReels] = useState<FeedPostView[]>([]);
  const [stories, setStories] = useState<StoryView[]>([]);
  const [notes, setNotes] = useState<(SocialNotification & { from: PublicUser | null })[]>([]);
  const [discover, setDiscover] = useState<{ characters: PublicUser[]; real: PublicUser[]; xoral: PublicUser[] }>({ characters: [], real: [], xoral: [] });
  const [authOpen, setAuthOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [story, setStory] = useState<StoryView | null>(null);
  const [fullScreen, setFullScreen] = useState(standalone);
  const [onPhone, setOnPhone] = useState(standalone);
  const [caption, setCaption] = useState('');
  const [draftImage, setDraftImage] = useState('');
  const [draftKind, setDraftKind] = useState<'post' | 'reel'>('post');
  const [libOpen, setLibOpen] = useState(false);
  const [clemxLib, setClemxLib] = useState<{ id: string; src: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [liveTitle, setLiveTitle] = useState('Live from the real world');
  const [liveError, setLiveError] = useState('');
  const [lives, setLives] = useState<any[]>([]);
  const [now, setNow] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const meRef = useRef<PublicUser | null>(null);
  const pendingAct = useRef<Record<string, unknown> | null>(null);
  const localLikes = useRef<Map<string, boolean>>(new Map());
  const localReposts = useRef<Map<string, boolean>>(new Map());
  meRef.current = me;

  const unread = notes.filter((n) => !n.read).length;

  const loadMe = useCallback(async () => {
    const data = await api('/api/xoral/me');
    setMe(data.user);
    meRef.current = data.user;
  }, []);

  const applyLocalFlags = useCallback((list: FeedPostView[]) => {
    return list.map((p) => {
      const liked = localLikes.current.get(p.id);
      const reposted = localReposts.current.get(p.id);
      let next = p;
      if (liked !== undefined && liked !== p.likedByMe) {
        next = { ...next, likedByMe: liked, likes: Math.max(0, p.likes + (liked ? 1 : -1)) };
      }
      if (reposted !== undefined && reposted !== p.repostedByMe) {
        next = { ...next, repostedByMe: reposted, reposts: Math.max(0, (p.reposts ?? 0) + (reposted ? 1 : -1)) };
      }
      return next;
    });
  }, []);

  const loadFeed = useCallback(async () => {
    const data = await api('/api/xoral/feed?tab=feed');
    setPosts(applyLocalFlags(data.posts || []));
    setStories(data.stories || []);
    if (data.me) {
      setMe(data.me);
      meRef.current = data.me;
    }
  }, [applyLocalFlags]);

  const loadRest = useCallback(async () => {
    const [r, n, d, l] = await Promise.all([
      api('/api/xoral/feed?tab=reels'),
      api('/api/xoral/notifications'),
      api('/api/xoral/discover'),
      api('/api/xoral/feed?tab=live'),
    ]);
    setReels(applyLocalFlags(r.posts || []));
    setNotes(n.items || []);
    setDiscover({ characters: d.characters || [], real: d.real || [], xoral: d.xoral || [] });
    setLives(l.lives || []);
    if (l.me) {
      setMe(l.me);
      meRef.current = l.me;
    }
  }, [applyLocalFlags]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setOnPhone(standalone || mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [standalone]);

  useEffect(() => {
    if (!fullScreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullScreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [fullScreen]);

  useEffect(() => {
    void loadMe();
    void loadFeed();
    if (!onPhone) void loadRest();
    else void api('/api/xoral/notifications').then((n) => setNotes(n.items || []));
    setNow(Date.now());
    const clock = window.setInterval(() => setNow(Date.now()), 60000);
    const poll = window.setInterval(() => {
      if (document.hidden) return;
      void loadFeed();
      void api('/api/xoral/notifications').then((n) => setNotes(n.items || []));
    }, 20000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(poll);
    };
  }, []);

  function openProfile(id: string) {
    setProfileId(id);
    setTab('profile');
  }

  function requireAuth(next?: Record<string, unknown>) {
    if (meRef.current) return true;
    if (next) pendingAct.current = next;
    setAuthOpen(true);
    return false;
  }

  function patchPost(postId: string, fn: (p: FeedPostView) => FeedPostView) {
    setPosts((list) => list.map((p) => (p.id === postId ? fn(p) : p)));
    setReels((list) => list.map((p) => (p.id === postId ? fn(p) : p)));
  }

  async function act(payload: Record<string, unknown>) {
    const action = String(payload.action || '');
    const self = meRef.current;
    const needsAccount = action === 'post' || action === 'comment' || action === 'reply' || action === 'follow' || action === 'story' || action === 'live-start' || action === 'live-end';

    if (action === 'like' && payload.targetType === 'post' && typeof payload.targetId === 'string') {
      const id = payload.targetId;
      const current = posts.find((p) => p.id === id) || reels.find((p) => p.id === id);
      const next = !(localLikes.current.get(id) ?? current?.likedByMe);
      localLikes.current.set(id, next);
      patchPost(id, (p) => ({ ...p, likedByMe: next, likes: Math.max(0, p.likes + (next ? 1 : -1)) }));
      if (!self) {
        pendingAct.current = payload;
        setAuthOpen(true);
        return;
      }
    }

    if (action === 'repost' && typeof payload.postId === 'string') {
      const id = payload.postId;
      const current = posts.find((p) => p.id === id) || reels.find((p) => p.id === id);
      const next = !(localReposts.current.get(id) ?? current?.repostedByMe);
      localReposts.current.set(id, next);
      patchPost(id, (p) => ({ ...p, repostedByMe: next, reposts: Math.max(0, (p.reposts ?? 0) + (next ? 1 : -1)) }));
      if (!self) {
        pendingAct.current = payload;
        setAuthOpen(true);
        return;
      }
    }

    if (needsAccount && !self) {
      pendingAct.current = payload;
      setAuthOpen(true);
      return;
    }

    if (action === 'post' && self && typeof payload.body === 'string') {
      const kind = payload.kind === 'reel' ? 'reel' : 'post';
      const fake: FeedPostView = {
        id: `tmp_p_${Date.now()}`,
        author: self,
        body: String(payload.body),
        image: typeof payload.image === 'string' && payload.image ? payload.image : undefined,
        hashtags: ['XoralParty'],
        kind,
        likes: 0,
        likedByMe: false,
        reposts: 0,
        repostedByMe: false,
        commentsCount: 0,
        createdAt: Date.now(),
        comments: [],
      };
      if (kind === 'reel') setReels((list) => [fake, ...list]);
      else setPosts((list) => [fake, ...list]);
    }

    if (action === 'comment' && self && typeof payload.postId === 'string' && typeof payload.body === 'string') {
      const body = payload.body;
      const postId = payload.postId;
      patchPost(postId, (p) => ({
        ...p,
        commentsCount: p.commentsCount + 1,
        comments: [
          ...p.comments,
          {
            id: `tmp_${Date.now()}`,
            author: self,
            body,
            likes: 0,
            likedByMe: false,
            createdAt: Date.now(),
            replies: [],
          },
        ],
      }));
    }
    if (action === 'reply' && self && typeof payload.commentId === 'string' && typeof payload.body === 'string') {
      const body = payload.body;
      const commentId = payload.commentId;
      patchPost(
        posts.find((p) => p.comments.some((c) => c.id === commentId))?.id
          || reels.find((p) => p.comments.some((c) => c.id === commentId))?.id
          || '',
        (p) => ({
          ...p,
          comments: p.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: [
                    ...c.replies,
                    { id: `tmp_${Date.now()}`, author: self, body, likes: 0, likedByMe: false, createdAt: Date.now() },
                  ],
                }
              : c,
          ),
        }),
      );
    }

    try {
      const data = await api('/api/xoral/action', { method: 'POST', body: JSON.stringify(payload) });
      if (data.me) {
        setMe(data.me);
        meRef.current = data.me;
      }
      if (action === 'like' && typeof payload.targetId === 'string' && typeof data.result?.liked === 'boolean') {
        localLikes.current.set(payload.targetId, data.result.liked);
      }
      if (action === 'repost' && typeof payload.postId === 'string' && typeof data.result?.reposted === 'boolean') {
        localReposts.current.set(payload.postId, data.result.reposted);
      }
      if (action === 'post' || action === 'story' || action === 'follow' || action === 'live-start') {
        await loadFeed();
        if (action !== 'post') await loadRest();
      }
    } catch {
      if (action === 'like' || action === 'repost') return;
      await loadFeed().catch(() => undefined);
    }
  }

  async function goLive() {
    setLiveError('');
    try {
      await act({ action: 'live-start', title: liveTitle });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true }).catch(() => null);
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setTab('live');
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : 'Cannot go live yet');
    }
  }

  const liveGate = useMemo(() => {
    if (!me) return null;
    return {
      fr: me.followersReal,
      fx: me.followersXoral,
      gr: me.followingReal,
      gx: me.followingXoral,
      ok: me.canGoLive,
    };
  }, [me]);

  async function attachFromFile(file: File) {
    const raw = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
    if (!raw) return;
    setDraftImage(await compressImage(raw));
  }

  function shareNow(kind: 'post' | 'reel') {
    if (!caption.trim() && !draftImage) return;
    void act({
      action: 'post',
      body: caption.trim() || (kind === 'reel' ? 'Reel' : 'Photo'),
      image: draftImage || undefined,
      kind,
    });
    setCaption('');
    setDraftImage('');
    setDraftKind('post');
    setLibOpen(false);
    if (kind === 'reel') setTab('reels');
  }

  const feedBody = (
    <div className="ig-feed">
      <div className="flex gap-3 overflow-x-auto px-3 pb-3 touch-pan-x">
        {me && (
          <button type="button" className="shrink-0 w-16 text-center" onClick={() => void act({ action: 'story' })}>
            <Ring active>
              <span className="relative">
                <Avatar user={me} size={56} />
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#ff2d8a] grid place-items-center text-xs">+</span>
              </span>
            </Ring>
            <p className="mt-1 text-[11px] text-white/60 truncate">Your story</p>
          </button>
        )}
        {stories.map((s) => (
          <div key={s.id} className="shrink-0 w-16 text-center">
            <button type="button" onClick={() => setStory(s)}>
              <Ring active>
                <Avatar user={s.author} size={56} />
              </Ring>
            </button>
            <button type="button" className="mt-1 text-[11px] text-white/60 truncate w-full" onClick={() => openProfile(s.author.id)}>
              {s.author.name.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>

      {me ? (
        <form
          className="ig-composer"
          onSubmit={(e) => {
            e.preventDefault();
            shareNow(draftKind);
          }}
        >
          {draftImage && (
            <div className="ig-composer-preview">
              <img src={draftImage} alt="" />
              <button type="button" onClick={() => setDraftImage('')}>Remove</button>
            </div>
          )}
          <textarea className="xp-field min-h-20" placeholder="Post from the real world…" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void attachFromFile(file);
            }}
          />
          <div className="ig-composer-tools">
            <button type="button" className="xp-btn xp-btn-ghost !text-xs !py-2" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="w-3.5 h-3.5" /> Gallery
            </button>
            <button
              type="button"
              className="xp-btn xp-btn-ghost !text-xs !py-2"
              onClick={() => {
                setClemxLib(readPhotos());
                setLibOpen((v) => !v);
              }}
            >
              Clemx Photos
            </button>
            <button type="submit" className="xp-btn xp-btn-primary !text-xs !py-2">{draftKind === 'reel' ? 'Share Reel' : 'Share'}</button>
            <button type="button" className="xp-btn xp-btn-ghost !text-xs !py-2" onClick={() => shareNow('reel')}>Reel</button>
          </div>
          {libOpen && (
            <div className="ig-lib">
              {clemxLib.length === 0 && <p className="text-xs text-white/50 col-span-3 py-2">No Clemx photos yet.</p>}
              {clemxLib.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    setDraftImage(photo.src);
                    setLibOpen(false);
                  }}
                >
                  <img src={photo.src} alt="" />
                </button>
              ))}
            </div>
          )}
        </form>
      ) : (
        <button type="button" onClick={() => setAuthOpen(true)} className="xp-glass w-full p-4 text-left">
          <p className="font-semibold">Create your Xoral account</p>
          <p className="text-sm text-white/50 mt-1">Log in here to post. Characters on the other side will see it — on their own time.</p>
        </button>
      )}

      {(onPhone ? posts.slice(0, 14) : posts).map((post) => (
        <PostCard
          key={post.id}
          post={post}
          now={now}
          me={me}
          requireAuth={requireAuth}
          onOpenProfile={openProfile}
          onLike={() => void act({ action: 'like', targetType: 'post', targetId: post.id })}
          onComment={(text) => void act({ action: 'comment', postId: post.id, body: text })}
          onReply={(commentId, text) => void act({ action: 'reply', commentId, body: text })}
          onLikeComment={(id) => void act({ action: 'like', targetType: 'comment', targetId: id })}
          onRepost={() => void act({ action: 'repost', postId: post.id })}
        />
      ))}
    </div>
  );

  const peopleRow = (title: string, people: PublicUser[]) => (
    <div className="mt-5">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">{title}</p>
      <div className="mt-2 space-y-2">
        {people.slice(0, 12).map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <button type="button" onClick={() => openProfile(p.id)} aria-label={`${p.handle} profile`}>
              <Avatar user={p} />
            </button>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openProfile(p.id)}>
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <p className="text-xs text-white/40">@{p.handle} · {p.city}</p>
            </button>
            <button type="button" className="xp-btn xp-btn-ghost !text-xs !py-2 !px-3 !w-auto" onClick={() => void act({ action: 'follow', targetId: p.id })}>
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className={standalone ? 'cx-os-standalone' : 'xp-section'} id="other-side">
      <div className={standalone ? '' : 'xp-wrap'}>
        {!standalone && !fullScreen && (
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="xp-kicker">04 — The other side</p>
            <h2 className="xp-display mt-3 text-[1.85rem] sm:text-4xl md:text-6xl">THE XORAL FEED</h2>
            <p className="mt-3 text-white/55 max-w-xl">Open it on the Clemx. Characters on the other side are counting down to 30 September. Your posts live on Xoral — they answer when they feel like it.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="xp-glass h-11 w-11 grid place-items-center"
              onClick={() => setFullScreen(true)}
              aria-label="Make phone full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        )}

        <ClemxPhone
          unread={unread}
          fullScreen={fullScreen || standalone}
          native={standalone}
          onToggleFull={standalone ? undefined : () => setFullScreen((v) => !v)}
          onFeedOpen={() => {
            const share = takeXoralShare();
            if (!share) return;
            setDraftImage(share.src);
            setDraftKind(share.kind);
            setTab('feed');
          }}
          onOpenNotifications={() => { setNotesOpen(true); void api('/api/xoral/notifications', { method: 'POST' }); }}
          notificationTray={notesOpen ? (
            <div className="ig-sheet">
              <button type="button" className="ig-sheet-bg" onClick={() => setNotesOpen(false)} aria-label="Close notifications" />
              <div className="ig-sheet-card" role="dialog" aria-label="Notifications">
                <div className="ig-sheet-handle" />
                <div className="ig-sheet-head">
                  <span className="ig-sheet-spacer" />
                  <h3>Notifications</h3>
                  <button type="button" onClick={() => setNotesOpen(false)} className="h-10 w-10 grid place-items-center" aria-label="Close"><X className="w-4 h-4" /></button>
                </div>
                <div className="ig-sheet-list">
                  {notes.length === 0 && <p className="p-4 text-sm text-white/50">When a character replies, it shows up here.</p>}
                  {notes.map((n) => (
                    <div key={n.id} className="flex gap-3 px-4 py-3">
                      {n.from && <Avatar user={n.from} />}
                      <div>
                        <p className="text-sm">{n.body}</p>
                        <p className="text-xs text-white/35 mt-1">{timeAgo(n.createdAt, now)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        >
        <div className="xp-inapp">
          <div className="ig-appbar">
            <p>Xoral</p>
            <button
              type="button"
              className="ig-bell"
              onClick={() => { setNotesOpen(true); void api('/api/xoral/notifications', { method: 'POST' }); }}
              aria-label="Notifications"
            >
              <Heart className="w-5 h-5" />
              {unread > 0 && <b />}
            </button>
          </div>
          <div className="flex xp-inapp-tabs">
            {([
              ['feed', Home, 'Feed'],
              ['reels', Clapperboard, 'Reels'],
              ['live', Radio, 'Live'],
              ['profile', UserIcon, 'Profile'],
            ] as const).map(([id, Icon, label]) => (
              <button key={id} type="button" onClick={() => { if (id === 'profile') setProfileId(me?.id ?? null); else setProfileId(null); setTab(id); if (id !== 'feed') void loadRest(); }} className={`flex-1 min-h-12 grid place-items-center ${tab === id ? 'text-[var(--xp-gold)]' : 'text-white/45'}`}>
                <span className="flex items-center gap-1 text-xs uppercase tracking-wider"><Icon className="w-4 h-4" /> {label}</span>
              </button>
            ))}
          </div>

          <div className={`xp-inapp-scroll${tab === 'reels' ? ' xp-reels-scroll' : tab === 'feed' ? ' xp-feed-scroll' : tab === 'profile' ? ' xp-profile-scroll' : ''}`}>
            {tab === 'feed' && feedBody}

            {tab === 'reels' && (
              <ReelsFeed
                posts={reels.length ? reels : posts.filter((p) => p.kind === 'reel')}
                now={now}
                me={me}
                requireAuth={requireAuth}
                onOpenProfile={openProfile}
                onLike={(id) => void act({ action: 'like', targetType: 'post', targetId: id })}
                onComment={(id, text) => void act({ action: 'comment', postId: id, body: text })}
                onReply={(commentId, text) => void act({ action: 'reply', commentId, body: text })}
                onLikeComment={(id) => void act({ action: 'like', targetType: 'comment', targetId: id })}
                onRepost={(id) => void act({ action: 'repost', postId: id })}
              />
            )}

            {tab === 'live' && (
              <div className="space-y-4">
                <div className="xp-glass p-4">
                  <p className="font-semibold">Go Live</p>
                  <p className="text-sm text-white/55 mt-1">Need 100 followers in the real world and 100 in the Xoral universe, plus follow at least 10 people in each world.</p>
                  {liveGate && (
                    <p className="mt-3 text-xs text-white/50">
                      Followers {liveGate.fr}/100 real · {liveGate.fx}/100 Xoral. Following {liveGate.gr}/10 real · {liveGate.gx}/10 Xoral.
                    </p>
                  )}
                  <input className="xp-field mt-3" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} />
                  <button type="button" className="xp-btn xp-btn-primary mt-3" onClick={() => void goLive()}>Go Live</button>
                  {liveError && <p className="mt-2 text-sm text-[#ff7aa8]">{liveError}</p>}
                </div>
                <video ref={videoRef} className="w-full rounded-2xl bg-black aspect-[9/16] max-h-[50vh] object-cover" playsInline muted />
                {lives.map((live) => (
                  <div key={live.id} className="xp-glass p-4">
                    <p className="text-xs text-[#ff2d8a] uppercase tracking-wider">Live · {live.viewers} watching</p>
                    <p className="font-semibold mt-1">{live.title}</p>
                    <p className="text-sm text-white/50">@{live.host?.handle}</p>
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {live.chats?.map((chat: any) => (
                        <p key={chat.id} className="text-sm"><span className="font-semibold">{chat.author?.name}</span> {chat.body}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'profile' && (
              profileId || me ? (
                <ProfileView
                  userId={profileId || me!.id}
                  me={me}
                  onBack={profileId && profileId !== me?.id ? () => { setProfileId(null); setTab('feed'); } : undefined}
                  onFollow={(id) => void act({ action: 'follow', targetId: id })}
                  onOpenProfile={openProfile}
                  onLike={(id) => void act({ action: 'like', targetType: 'post', targetId: id })}
                  onRepost={(id) => void act({ action: 'repost', postId: id })}
                  requireAuth={requireAuth}
                  onLogout={
                    (profileId || me?.id) === me?.id
                      ? () => void api('/api/xoral/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }).then(() => { setMe(null); meRef.current = null; setProfileId(null); void loadFeed(); })
                      : undefined
                  }
                />
              ) : (
                <div className="p-4">
                  <button type="button" className="xp-btn xp-btn-primary" onClick={() => setAuthOpen(true)}>Create Xoral account</button>
                  {peopleRow('Xoral characters', discover.characters)}
                  {peopleRow('Real world', discover.real)}
                  {peopleRow('Xoral universe', discover.xoral)}
                </div>
              )
            )}
          </div>
          {authOpen && (
            <AuthSheet
              onClose={() => setAuthOpen(false)}
              onDone={() => {
                void (async () => {
                  await loadMe();
                  const pending = pendingAct.current;
                  pendingAct.current = null;
                  if (pending) await act(pending);
                  else await loadFeed();
                })();
              }}
            />
          )}
          {story && (
            <button type="button" className="ig-story-full" onClick={() => setStory(null)}>
              <img src={story.image} alt="" />
              <div className="ig-story-user">
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    const id = story.author.id;
                    setStory(null);
                    openProfile(id);
                  }}
                >
                  <Avatar user={story.author} />
                  <p className="font-semibold">{story.author.name}</p>
                </span>
              </div>
              {story.body && <p className="ig-story-body">{story.body}</p>}
            </button>
          )}
        </div>
        </ClemxPhone>
      </div>

      {story && !onPhone && (
        <button type="button" className="fixed inset-0 z-[96] bg-black" onClick={() => setStory(null)}>
          <img src={story.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute top-8 left-4 right-4 flex items-center gap-3">
            <Avatar user={story.author} />
            <p className="font-semibold">{story.author.name}</p>
          </div>
          {story.body && <p className="absolute bottom-10 left-4 right-4 text-lg">{story.body}</p>}
        </button>
      )}
    </section>
  );
}
