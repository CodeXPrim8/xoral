import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import * as local from '@/lib/storage';
import type { CommunityPost, Notification } from '@/lib/types';
import { creatorAvatar } from '@/lib/media';

async function getUserId(): Promise<string | null> {
  const supabase = createClientIfConfigured();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getSessionUser() {
  const supabase = createClientIfConfigured();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function loginUrl(next?: string) {
  if (!next) return '/login';
  return `/login?next=${encodeURIComponent(next)}`;
}

export async function getWatchlist(): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return local.getWatchlist();

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase
    .from('watchlist')
    .select('title_slug')
    .eq('user_id', userId);
  return data?.map((row) => row.title_slug) ?? [];
}

export async function toggleWatchlist(slug: string): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return local.toggleWatchlist(slug);

  const supabase = createClientIfConfigured()!;
  const { data: existing } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', userId)
    .eq('title_slug', slug)
    .maybeSingle();

  if (existing) {
    await supabase.from('watchlist').delete().eq('id', existing.id);
  } else {
    await supabase.from('watchlist').insert({ user_id: userId, title_slug: slug });
  }
  return getWatchlist();
}

export async function isInWatchlist(slug: string): Promise<boolean> {
  const list = await getWatchlist();
  return list.includes(slug);
}

export async function getWatched(): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return local.getWatched();

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase
    .from('watched')
    .select('title_slug')
    .eq('user_id', userId);
  return data?.map((row) => row.title_slug) ?? [];
}

export async function markWatched(slug: string): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return local.markWatched(slug);

  const supabase = createClientIfConfigured()!;
  await supabase
    .from('watched')
    .upsert({ user_id: userId, title_slug: slug }, { onConflict: 'user_id,title_slug' });
  return getWatched();
}

export async function getFollows() {
  const userId = await getUserId();
  if (!userId) return local.getFollows();

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase.from('follows').select('target_type, target_id').eq('user_id', userId);
  const creators: string[] = [];
  const characters: string[] = [];
  data?.forEach((row) => {
    if (row.target_type === 'creator') creators.push(row.target_id);
    if (row.target_type === 'character') characters.push(row.target_id);
  });
  return { creators, characters };
}

async function toggleFollow(targetType: 'creator' | 'character', targetId: string) {
  const userId = await getUserId();
  if (!userId) {
    if (targetType === 'creator') return local.toggleCreatorFollow(targetId);
    return local.toggleCharacterFollow(targetId);
  }

  const supabase = createClientIfConfigured()!;
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
  } else {
    await supabase.from('follows').insert({ user_id: userId, target_type: targetType, target_id: targetId });
  }
  return getFollows();
}

export async function toggleCreatorFollow(id: string) {
  return toggleFollow('creator', id);
}

export async function toggleCharacterFollow(id: string) {
  return toggleFollow('character', id);
}

export async function isCreatorFollowed(id: string) {
  const follows = await getFollows();
  return follows.creators.includes(id);
}

export async function isCharacterFollowed(id: string) {
  const follows = await getFollows();
  return follows.characters.includes(id);
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const userId = await getUserId();
  if (!userId) return local.getCommunityPosts();

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase
    .from('community_posts')
    .select('id, content, likes, comments, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    author: 'You',
    avatar: creatorAvatar('cr1'),
    content: row.content,
    timestamp: 'Just now',
    likes: row.likes,
    comments: row.comments,
  }));
}

export async function addCommunityPost(content: string): Promise<CommunityPost[]> {
  const userId = await getUserId();
  if (!userId) return local.addCommunityPost(content);

  const supabase = createClientIfConfigured()!;
  await supabase.from('community_posts').insert({ user_id: userId, content });
  return getCommunityPosts();
}

export async function likeCommunityPost(id: string): Promise<CommunityPost[]> {
  const userId = await getUserId();
  if (!userId) return local.likeCommunityPost(id);

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase.from('community_posts').select('likes').eq('id', id).single();
  if (data) {
    await supabase.from('community_posts').update({ likes: data.likes + 1 }).eq('id', id);
  }
  return getCommunityPosts();
}

export async function getNotifications(): Promise<Notification[]> {
  const userId = await getUserId();
  if (!userId) return local.getNotifications();

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase
    .from('notifications')
    .select('id, title, message, read')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    read: row.read,
  }));
}

export async function markNotificationsRead(): Promise<Notification[]> {
  const userId = await getUserId();
  if (!userId) return local.markNotificationsRead();

  const supabase = createClientIfConfigured()!;
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  return getNotifications();
}

export async function getProfile() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return {
    email: user.email ?? '',
    displayName: data?.display_name ?? user.email?.split('@')[0] ?? 'Member',
    avatarUrl: data?.avatar_url ?? creatorAvatar('cr1'),
    plan: data?.plan ?? 'Free',
  };
}

export async function signOut() {
  const supabase = createClientIfConfigured();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function requireAuthForAction(nextPath: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const user = await getSessionUser();
  if (user) return true;
  if (typeof window !== 'undefined') {
    window.location.href = loginUrl(nextPath);
  }
  return false;
}

export async function migrateLocalStorageToSupabase() {
  const userId = await getUserId();
  if (!userId) return;

  const migrated = localStorage.getItem('xoral_migrated');
  if (migrated) return;

  const supabase = createClientIfConfigured()!;

  const watchlist = local.getWatchlist();
  if (watchlist.length) {
    await supabase.from('watchlist').upsert(
      watchlist.map((slug) => ({ user_id: userId, title_slug: slug })),
      { onConflict: 'user_id,title_slug' }
    );
  }

  const watched = local.getWatched();
  if (watched.length) {
    await supabase.from('watched').upsert(
      watched.map((slug) => ({ user_id: userId, title_slug: slug })),
      { onConflict: 'user_id,title_slug' }
    );
  }

  const follows = local.getFollows();
  const followRows = [
    ...follows.creators.map((id) => ({ user_id: userId, target_type: 'creator', target_id: id })),
    ...follows.characters.map((id) => ({ user_id: userId, target_type: 'character', target_id: id })),
  ];
  if (followRows.length) {
    await supabase.from('follows').upsert(followRows, { onConflict: 'user_id,target_type,target_id' });
  }

  localStorage.setItem('xoral_migrated', 'true');
}
