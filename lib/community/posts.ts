import type { CommunityMediaType } from '@/lib/types';

export function inferMediaType(post: {
  mediaType?: CommunityMediaType;
  videoUrl?: string | null;
  image?: string | null;
}): CommunityMediaType {
  if (post.mediaType) return post.mediaType;
  if (post.videoUrl) return 'video';
  if (post.image) return 'image';
  return 'text';
}
