export type World = 'real' | 'xoral';

export type XoralUser = {
  id: string;
  handle: string;
  name: string;
  passwordHash: string;
  world: World;
  gender: 'male' | 'female';
  bio: string;
  image: string;
  city: string;
  isCharacter: boolean;
  voice?: string;
  createdAt: number;
};

export type SocialPost = {
  id: string;
  authorId: string;
  body: string;
  image?: string;
  video?: string;
  hashtags: string[];
  kind: 'post' | 'reel';
  createdAt: number;
};

export type SocialRepost = {
  userId: string;
  postId: string;
};

export type SocialComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: number;
  typingName?: string;
};

export type SocialReply = {
  id: string;
  commentId: string;
  authorId: string;
  body: string;
  createdAt: number;
};

export type SocialLike = {
  userId: string;
  targetType: 'post' | 'comment' | 'reply';
  targetId: string;
};

export type SocialFollow = {
  followerId: string;
  followingId: string;
};

export type SocialStory = {
  id: string;
  authorId: string;
  image: string;
  body?: string;
  createdAt: number;
  expiresAt: number;
};

export type SocialLive = {
  id: string;
  hostId: string;
  title: string;
  startedAt: number;
  endedAt?: number;
  viewers: number;
};

export type SocialLiveChat = {
  id: string;
  liveId: string;
  authorId: string;
  body: string;
  createdAt: number;
};

export type SocialNotification = {
  id: string;
  userId: string;
  kind: 'reply' | 'comment' | 'like' | 'follow' | 'live';
  fromId: string;
  postId?: string;
  commentId?: string;
  body: string;
  read: boolean;
  createdAt: number;
};

export type SocialJob = {
  id: string;
  at: number;
  kind: 'reply' | 'comment' | 'like' | 'follow' | 'universe_post' | 'live_comment' | 'story_seed';
  payload: Record<string, string>;
};

export type SocialSession = {
  token: string;
  userId: string;
  expiresAt: number;
};

export type XoralDb = {
  users: XoralUser[];
  sessions: SocialSession[];
  posts: SocialPost[];
  comments: SocialComment[];
  replies: SocialReply[];
  likes: SocialLike[];
  reposts: SocialRepost[];
  follows: SocialFollow[];
  stories: SocialStory[];
  lives: SocialLive[];
  liveChats: SocialLiveChat[];
  notifications: SocialNotification[];
  jobs: SocialJob[];
};

export type PublicUser = Omit<XoralUser, 'passwordHash'> & {
  followersReal: number;
  followersXoral: number;
  followingReal: number;
  followingXoral: number;
  postsCount: number;
  canGoLive: boolean;
  role: string;
  link?: string;
  audiencePosts: number;
  audienceFollowers: number;
  audienceFollowing: number;
};

export type FeedPostView = {
  id: string;
  author: PublicUser;
  body: string;
  image?: string;
  video?: string;
  audio?: string;
  hashtags: string[];
  kind: 'post' | 'reel';
  likes: number;
  likedByMe: boolean;
  reposts: number;
  repostedByMe: boolean;
  commentsCount: number;
  createdAt: number;
  comments: {
    id: string;
    author: PublicUser;
    body: string;
    likes: number;
    likedByMe: boolean;
    createdAt: number;
    typingName?: string;
    replies: {
      id: string;
      author: PublicUser;
      body: string;
      likes: number;
      likedByMe: boolean;
      createdAt: number;
    }[];
  }[];
};
