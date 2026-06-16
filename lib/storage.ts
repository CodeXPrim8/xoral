import type { CommunityPost, Notification } from './types';
import { creatorAvatar } from './media';

const KEYS = {
  watchlist: 'xoral_watchlist',
  watched: 'xoral_watched',
  follows: 'xoral_follows',
  community: 'xoral_community_posts',
  notifications: 'xoral_notifications',
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const defaultNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'New episode available',
    message: 'Ashes to Crown — Episode 6 is now streaming on XORAL.',
    read: false,
  },
  {
    id: 'n2',
    title: 'Added to your list',
    message: 'Nexus Protocol was saved to your watchlist.',
    read: false,
  },
  {
    id: 'n3',
    title: 'AI Star spotlight',
    message: 'Lora Adams appears in two new XORAL originals this week.',
    read: true,
  },
];

export function getWatchlist(): string[] {
  return readJson<string[]>(KEYS.watchlist, []);
}

export function toggleWatchlist(slug: string): string[] {
  const current = getWatchlist();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  writeJson(KEYS.watchlist, next);
  return next;
}

export function isInWatchlist(slug: string) {
  return getWatchlist().includes(slug);
}

export function getWatched(): string[] {
  return readJson<string[]>(KEYS.watched, []);
}

export function markWatched(slug: string): string[] {
  const current = getWatched();
  if (current.includes(slug)) return current;
  const next = [...current, slug];
  writeJson(KEYS.watched, next);
  return next;
}

export function getFollows() {
  return readJson<{ creators: string[]; characters: string[] }>(KEYS.follows, {
    creators: [],
    characters: [],
  });
}

export function toggleCreatorFollow(id: string) {
  const current = getFollows();
  const creators = current.creators.includes(id)
    ? current.creators.filter((item) => item !== id)
    : [...current.creators, id];
  const next = { ...current, creators };
  writeJson(KEYS.follows, next);
  return next;
}

export function toggleCharacterFollow(id: string) {
  const current = getFollows();
  const characters = current.characters.includes(id)
    ? current.characters.filter((item) => item !== id)
    : [...current.characters, id];
  const next = { ...current, characters };
  writeJson(KEYS.follows, next);
  return next;
}

export function isCreatorFollowed(id: string) {
  return getFollows().creators.includes(id);
}

export function isCharacterFollowed(id: string) {
  return getFollows().characters.includes(id);
}

export function getCommunityPosts(): CommunityPost[] {
  return readJson<CommunityPost[]>(KEYS.community, []);
}

export function addCommunityPost(content: string) {
  const post: CommunityPost = {
    id: `local-${Date.now()}`,
    author: 'You',
    avatar: creatorAvatar('cr1'),
    content,
    timestamp: 'Just now',
    likes: 0,
    comments: 0,
  };
  const next = [post, ...getCommunityPosts()];
  writeJson(KEYS.community, next);
  return next;
}

export function likeCommunityPost(id: string) {
  const next = getCommunityPosts().map((post) =>
    post.id === id ? { ...post, likes: post.likes + 1 } : post
  );
  writeJson(KEYS.community, next);
  return next;
}

export function getNotifications(): Notification[] {
  const stored = readJson<Notification[] | null>(KEYS.notifications, null);
  if (!stored) {
    writeJson(KEYS.notifications, defaultNotifications);
    return defaultNotifications;
  }
  return stored;
}

export function markNotificationsRead() {
  const next = getNotifications().map((notification) => ({ ...notification, read: true }));
  writeJson(KEYS.notifications, next);
  return next;
}
