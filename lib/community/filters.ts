import type { CommunityPost, CommunityPostKind } from '@/lib/types';
import { inferMediaType } from './posts';

export type CommunitySection = 'posts' | 'shorts';

type CommunityRowLike = {
  post_kind?: string | null;
  video_url?: string | null;
  image_url?: string | null;
  media_type?: string | null;
};

/** Classify a row/post for Post vs Shorts (handles DB without post_kind column). */
export function inferPostKind(
  row: CommunityRowLike,
  mapped?: Pick<CommunityPost, 'videoUrl' | 'image' | 'mediaType' | 'postKind'>
): CommunityPostKind {
  if (row.post_kind === 'short') return 'short';
  if (row.post_kind === 'post') return 'post';

  const videoUrl = row.video_url ?? mapped?.videoUrl;
  const image = row.image_url ?? mapped?.image;
  const mediaType =
    row.media_type ??
    mapped?.mediaType ??
    inferMediaType({ videoUrl, image });

  if (videoUrl && mediaType === 'video') return 'short';
  return 'post';
}

export function resolvePostKind(post: CommunityPost): CommunityPostKind {
  return inferPostKind(
    {
      post_kind: post.postKind,
      video_url: post.videoUrl,
      image_url: post.image,
      media_type: post.mediaType,
    },
    post
  );
}

export function filterPostsByKind(posts: CommunityPost[], kind?: CommunityPostKind): CommunityPost[] {
  if (!kind) return posts;
  return posts.filter((post) => resolvePostKind(post) === kind);
}

export function filterByKind(posts: CommunityPost[], kind: CommunityPostKind): CommunityPost[] {
  return filterPostsByKind(posts, kind);
}

export function sortPosts(posts: CommunityPost[]): CommunityPost[] {
  return [...posts];
}

export function sortShorts(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => b.likes - a.likes);
}

export function filterUserPosts(posts: CommunityPost[], userId: string, kind?: CommunityPostKind) {
  return posts.filter((post) => {
    if (post.userId !== userId) return false;
    if (kind) return resolvePostKind(post) === kind;
    return true;
  });
}

export { inferMediaType };
