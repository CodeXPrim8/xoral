import type { CmsSeason } from '@/lib/cms/episodes';

export type ContentType = 'movie' | 'ai' | 'series';

export type Title = {
  id: string;
  slug: string;
  title: string;
  image: string;
  rating: number;
  type: ContentType;
  description: string;
  genre: string;
  maturityRating: number;
  cast: string[];
  isAiGenerated: boolean;
  trailerUrl?: string;
  videoUrl?: string;
  subtitle?: string;
  seasons?: CmsSeason[];
};

export type Character = {
  id: string;
  slug: string;
  name: string;
  gender: 'male' | 'female';
  age?: number;
  nationality: string;
  height: string;
  eyes: string;
  hair: string;
  personality: string;
  style: string;
  voice: string;
  profession: string;
  skinColor: string;
  image: string;
  description: string;
};

export type Creator = {
  id: string;
  name: string;
  image: string;
  followers: string;
  specialization: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  image?: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
};

export type ContinueWatchingItem = Title & {
  progress: number;
  episodeLabel?: string;
};
