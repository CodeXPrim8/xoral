import type { User } from '@supabase/supabase-js';
import { createClientIfConfigured } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import * as local from '@/lib/storage';
import type { CommunityPost, Notification, PublicProfile } from '@/lib/types';
import { inferMediaType } from '@/lib/community/posts';
import { filterPostsByKind, inferPostKind, resolvePostKind } from '@/lib/community/filters';

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

export async function getFollowedUserIds(): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return local.getFollowedUserIds();

  const supabase = createClientIfConfigured()!;
  const { data } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', userId);

  return data?.map((row) => row.following_id) ?? [];
}

export async function isFollowingUser(targetUserId: string): Promise<boolean> {
  const ids = await getFollowedUserIds();
  return ids.includes(targetUserId);
}

export async function toggleUserFollow(targetUserId: string): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return local.toggleUserFollow(targetUserId);

  const supabase = createClientIfConfigured()!;
  const { data: existing } = await supabase
    .from('user_follows')
    .select('follower_id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetUserId);
  } else {
    await supabase.from('user_follows').insert({
      follower_id: userId,
      following_id: targetUserId,
    });
  }

  return getFollowedUserIds();
}

export async function getSubscribedUserIds(): Promise<string[]> {
  return getFollowedUserIds();
}

export async function isSubscribedTo(targetUserId: string): Promise<boolean> {
  return isFollowingUser(targetUserId);
}

export async function toggleSubscribe(targetUserId: string): Promise<string[]> {
  return toggleUserFollow(targetUserId);
}

export async function getSubscriberCount(targetUserId: string): Promise<number> {
  const supabase = createClientIfConfigured();
  if (!supabase) return local.getSubscriberCount(targetUserId);

  const { data, error } = await supabase.rpc('subscriber_count', { target_user_id: targetUserId });
  if (error) {
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
    return count ?? 0;
  }
  return (data as number) ?? 0;
}

function mapCommunityRow(row: {
  id: string;
  user_id: string;
  content: string | null;
  likes: number;
  comments: number;
  image_url?: string | null;
  video_url?: string | null;
  media_type?: string | null;
  post_kind?: string | null;
  music_url?: string | null;
  video_trim_start?: number | null;
  video_trim_end?: number | null;
  created_at: string;
  profiles: { display_name?: string; avatar_url?: string } | { display_name?: string; avatar_url?: string }[] | null;
}): CommunityPost {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    userId: row.user_id,
    author: profile?.display_name ?? 'Member',
    avatar: profile?.avatar_url ?? '/placeholder-user.jpg',
    content: row.content ?? '',
    timestamp: new Date(row.created_at).toLocaleDateString(),
    likes: row.likes,
    comments: row.comments,
    image: row.image_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    mediaType: inferMediaType({
      mediaType: row.media_type as CommunityPost['mediaType'] | undefined,
      videoUrl: row.video_url,
      image: row.image_url,
    }),
    postKind: inferPostKind(row),
    musicUrl: row.music_url ?? undefined,
    videoTrimStart: row.video_trim_start ?? undefined,
    videoTrimEnd: row.video_trim_end ?? undefined,
  };
}

const COMMUNITY_SELECT_FULL =
  'id, user_id, content, likes, comments, image_url, video_url, media_type, post_kind, music_url, video_trim_start, video_trim_end, created_at, profiles(display_name, avatar_url)';

const COMMUNITY_SELECT_MEDIA =
  'id, user_id, content, likes, comments, image_url, video_url, media_type, created_at, profiles(display_name, avatar_url)';

const COMMUNITY_SELECT_BASE =
  'id, user_id, content, likes, comments, image_url, created_at, profiles(display_name, avatar_url)';

const COMMUNITY_SELECTS = [COMMUNITY_SELECT_FULL, COMMUNITY_SELECT_MEDIA, COMMUNITY_SELECT_BASE];

function mergePostsById(...groups: CommunityPost[][]): CommunityPost[] {
  const byId = new Map<string, CommunityPost>();
  for (const group of groups) {
    for (const post of group) {
      byId.set(post.id, post);
    }
  }
  return Array.from(byId.values()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

async function queryCommunityPosts(options?: {
  userId?: string;
  kind?: CommunityPost['postKind'];
}): Promise<CommunityPost[]> {
  const supabase = createClientIfConfigured();
  if (!supabase) return [];

  let data: Parameters<typeof mapCommunityRow>[0][] | null = null;
  let lastError: { message: string } | null = null;

  for (const select of COMMUNITY_SELECTS) {
    let query = supabase
      .from('community_posts')
      .select(select)
      .order('created_at', { ascending: false });

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    const result = await query;
    if (!result.error) {
      data = (result.data ?? []) as Parameters<typeof mapCommunityRow>[0][];
      break;
    }
    lastError = result.error;
  }

  if (!data) {
    console.error('Failed to load community posts:', lastError?.message);
    return [];
  }

  return filterPostsByKind(data.map(mapCommunityRow), options?.kind);
}

async function fetchCommunityPostsFromSupabase(
  kind?: CommunityPost['postKind']
): Promise<CommunityPost[]> {
  return queryCommunityPosts({ kind });
}

export async function getCommunityPosts(kind?: CommunityPost['postKind']): Promise<CommunityPost[]> {
  const supabase = createClientIfConfigured();
  const userId = await getUserId();

  if (!supabase) {
    const all = local.getCommunityPosts();
    return filterPostsByKind(all, kind);
  }

  const serverPosts = await fetchCommunityPostsFromSupabase(kind);

  if (!userId) {
    const localPosts = filterPostsByKind(local.getCommunityPosts(), kind);
    return mergePostsById(localPosts, serverPosts);
  }

  return serverPosts;
}

export async function getUserCommunityPosts(
  userId: string,
  kind?: CommunityPost['postKind']
): Promise<CommunityPost[]> {
  const supabase = createClientIfConfigured();
  if (!supabase) {
    const all = local.getCommunityPosts().filter((p) => p.userId === userId || p.userId === 'local-user');
    return filterPostsByKind(all, kind);
  }

  return queryCommunityPosts({ userId, kind });
}

export type NewCommunityPostInput = {
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: CommunityPost['mediaType'];
  postKind?: CommunityPost['postKind'];
  musicUrl?: string;
  videoTrimStart?: number;
  videoTrimEnd?: number;
};

export async function addCommunityPost(input: NewCommunityPostInput | string): Promise<CommunityPost[]> {
  const payload: NewCommunityPostInput =
    typeof input === 'string' ? { content: input, postKind: 'post' } : input;

  const mediaType =
    payload.mediaType ??
    (payload.videoUrl ? 'video' : payload.imageUrl ? 'image' : 'text');
  const postKind = payload.postKind ?? 'post';

  if (!payload.content?.trim() && !payload.imageUrl && !payload.videoUrl) {
    throw new Error('Add a caption, photo, or video.');
  }

  if (postKind === 'short' && !payload.videoUrl) {
    throw new Error('Shorts require a video.');
  }

  const userId = await getUserId();
  if (!userId) {
    local.addCommunityPost({
      content: payload.content,
      image: payload.imageUrl,
      videoUrl: payload.videoUrl,
      mediaType,
      postKind,
      musicUrl: payload.musicUrl,
      videoTrimStart: payload.videoTrimStart,
      videoTrimEnd: payload.videoTrimEnd,
    });
    return getCommunityPosts(postKind);
  }

  const supabase = createClientIfConfigured()!;

  const insertAttempts: Record<string, unknown>[] = [
    {
      user_id: userId,
      content: payload.content?.trim() || null,
      image_url: payload.imageUrl ?? null,
      video_url: payload.videoUrl ?? null,
      media_type: mediaType,
      post_kind: postKind,
      music_url: payload.musicUrl ?? null,
      video_trim_start: payload.videoTrimStart ?? 0,
      video_trim_end: payload.videoTrimEnd ?? null,
    },
    {
      user_id: userId,
      content: payload.content?.trim() || null,
      image_url: payload.imageUrl ?? null,
      video_url: payload.videoUrl ?? null,
      media_type: mediaType,
      post_kind: postKind,
    },
    {
      user_id: userId,
      content: payload.content?.trim() || null,
      image_url: payload.imageUrl ?? null,
      video_url: payload.videoUrl ?? null,
      media_type: mediaType,
    },
    {
      user_id: userId,
      content: payload.content?.trim() || null,
      image_url: payload.imageUrl ?? null,
    },
    ...(postKind === 'short'
      ? []
      : [
          {
            user_id: userId,
            content: payload.content?.trim() || 'Post',
          },
        ]),
  ];

  let lastError: { message: string } | null = null;
  for (const row of insertAttempts) {
    const { error } = await supabase.from('community_posts').insert(row);
    if (!error) {
      return getCommunityPosts(postKind);
    }
    lastError = error;
  }

  if (postKind === 'short') {
    throw new Error(
      lastError?.message ??
        'Could not save Short. Run supabase/RUN-IN-SUPABASE-community-all.sql in Supabase to enable video Shorts.'
    );
  }

  throw new Error(lastError?.message ?? 'Could not save post');
}

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const supabase = createClientIfConfigured();
  if (!supabase) {
    const posts = local.getCommunityPosts().filter((p) => p.userId === userId);
    return {
      id: userId,
      displayName: 'Member',
      avatarUrl: '/placeholder-user.jpg',
      bio: '',
      subscriberCount: local.getSubscriberCount(userId),
      postCount: posts.filter((p) => resolvePostKind(p) === 'post').length,
      shortCount: posts.filter((p) => resolvePostKind(p) === 'short').length,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, bio, banner_url, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) return null;

  const [subscriberCount, allPosts] = await Promise.all([
    getSubscriberCount(userId),
    getUserCommunityPosts(userId),
  ]);

  return {
    id: profile.id,
    displayName: profile.display_name ?? 'Member',
    avatarUrl: profile.avatar_url ?? '/placeholder-user.jpg',
    bio: profile.bio ?? undefined,
    bannerUrl: profile.banner_url ?? undefined,
    subscriberCount,
    postCount: allPosts.filter((p) => resolvePostKind(p) === 'post').length,
    shortCount: allPosts.filter((p) => resolvePostKind(p) === 'short').length,
    memberSince: profile.created_at,
  };
}

export async function updateCommunityProfile(input: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error('Sign in to edit your profile');

  const supabase = createClientIfConfigured()!;
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName,
      bio: input.bio,
      avatar_url: input.avatarUrl,
      banner_url: input.bannerUrl,
    })
    .eq('id', userId);

  if (error) throw error;
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
    bio: (data as { bio?: string })?.bio ?? '',
    bannerUrl: (data as { banner_url?: string })?.banner_url ?? '',
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

  const communityPosts = local.getCommunityPosts();
  if (communityPosts.length) {
    for (const post of communityPosts) {
      const row = {
        user_id: userId,
        content: post.content || null,
        image_url: post.image ?? null,
        video_url: post.videoUrl ?? null,
        media_type: post.mediaType ?? 'text',
        post_kind: post.postKind ?? 'post',
        music_url: post.musicUrl ?? null,
        video_trim_start: post.videoTrimStart ?? 0,
        video_trim_end: post.videoTrimEnd ?? null,
      };

      let { error } = await supabase.from('community_posts').insert(row);
      if (error?.message?.includes('post_kind') || error?.code === '42703') {
        ({ error } = await supabase.from('community_posts').insert({
          user_id: userId,
          content: post.content || null,
          image_url: post.image ?? null,
          video_url: post.videoUrl ?? null,
          media_type: post.mediaType ?? 'text',
        }));
      }
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('xoral_community_posts');
    }
  }

  localStorage.setItem('xoral_migrated', 'true');
}
