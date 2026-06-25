import type { User } from '@supabase/supabase-js';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import * as local from '@/lib/storage';
import type { CommunityPost, Notification } from '@/lib/types';

async function getUserId(): Promise<string | null> {
  const supabase = createClientIfConfigured();
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getSessionUser() {
  const supabase = createClientIfConfigured();
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
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
  const supabase = createClientIfConfigured();
  if (!supabase) return local.getCommunityPosts();

  const { data } = await supabase
    .from('community_posts')
    .select('id, content, likes, comments, created_at, profiles(display_name, avatar_url)')
    .order('created_at', { ascending: false });

  return (data ?? []).map((row) => {
    const profile = row.profiles as { display_name?: string; avatar_url?: string } | null;
    return {
      id: row.id,
      author: profile?.display_name ?? 'Member',
      avatar: profile?.avatar_url ?? '/placeholder-user.jpg',
      content: row.content,
      timestamp: new Date(row.created_at).toLocaleDateString(),
      likes: row.likes,
      comments: row.comments,
    };
  });
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
  await supabase.rpc('like_community_post', { post_id: id });
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
  return getProfileForUser(user);
}

export async function getProfileForUser(user: User) {
  const supabase = createClientIfConfigured()!;
  let { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  const displayNameFromMeta =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'Member';

  if (!data) {
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: user.id, display_name: displayNameFromMeta })
      .select('*')
      .maybeSingle();
    data = created;
  }

  return {
    email: user.email ?? '',
    displayName: data?.display_name ?? displayNameFromMeta,
    avatarUrl: data?.avatar_url ?? '/placeholder-user.jpg',
    plan: data?.plan ?? 'Free',
    role: data?.role ?? 'user',
    memberSince: data?.created_at ?? user.created_at,
  };
}

export async function getProfileStats() {
  const userId = await getUserId();
  if (!userId) {
    return { titlesSaved: 0, titlesWatched: 0, communityPosts: 0 };
  }
  return getProfileStatsForUser(userId);
}

export async function getProfileStatsForUser(userId: string) {
  const supabase = createClientIfConfigured()!;
  const [watchlist, watched, postsResult] = await Promise.all([
    supabase.from('watchlist').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('watched').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    titlesSaved: watchlist.count ?? 0,
    titlesWatched: watched.count ?? 0,
    communityPosts: postsResult.count ?? 0,
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
