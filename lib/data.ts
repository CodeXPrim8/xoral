import type { ContinueWatchingItem, Creator, Title } from './types';
import { creatorAvatar, titlePoster, XORAL_HERO } from './media';

export const heroContent = {
  slug: 'ashes-to-crown',
  title: 'Ashes to Crown',
  description:
    "A general's daughter marries for love, only to lose her clan and her life. Reborn on her wedding eve, Chu Zhao vows to rewrite her fate and seize power.",
  rating: 16,
  category: 'Drama',
  image: XORAL_HERO,
  subtitle: 'New Episodes Coming Wednesday',
};

export const allTitles: Title[] = [
  {
    id: 'ashes-to-crown',
    slug: 'ashes-to-crown',
    title: 'Ashes to Crown',
    image: titlePoster('ashes-to-crown'),
    rating: 9.2,
    type: 'series',
    description:
      "A general's daughter marries for love, only to lose her clan and her life. Reborn on her wedding eve, Chu Zhao vows to rewrite her fate and seize power.",
    genre: 'Drama',
    maturityRating: 16,
    cast: ['layla-baker', 'clark-sylvester', 'nicolas-martinez', 'sandra-rosewood'],
    isAiGenerated: true,
    subtitle: 'New Episodes Coming Wednesday',
  },
  {
    id: 'nexus-protocol',
    slug: 'nexus-protocol',
    title: 'Nexus Protocol',
    image: titlePoster('nexus-protocol'),
    rating: 9,
    type: 'movie',
    description:
      'When a rogue AI seizes a global network, an elite coder and a disgraced agent must infiltrate the nexus before reality itself is rewritten.',
    genre: 'Sci-Fi',
    maturityRating: 13,
    cast: ['cho-ichiro', 'clara-christopher', 'spencer-hawk'],
    isAiGenerated: false,
  },
  {
    id: 'cipher-origins',
    slug: 'cipher-origins',
    title: 'Cipher Origins',
    image: titlePoster('cipher-origins'),
    rating: 8.8,
    type: 'movie',
    description:
      'A cryptographer haunted by a missing sister uncovers a cipher that predates civilization — and a secret society willing to kill for it.',
    genre: 'Thriller',
    maturityRating: 16,
    cast: ['fiona-matthew', 'davis-blake', 'clark-sylvester'],
    isAiGenerated: false,
  },
  {
    id: 'quantum-void',
    slug: 'quantum-void',
    title: 'Quantum Void',
    image: titlePoster('quantum-void'),
    rating: 8.5,
    type: 'movie',
    description:
      'An experimental physicist opens a window into a parallel earth where every choice she never made has already played out.',
    genre: 'Sci-Fi',
    maturityRating: 13,
    cast: ['lora-adams', 'henry-uchenna', 'sapphire-paggie'],
    isAiGenerated: true,
  },
  {
    id: 'digital-dreams',
    slug: 'digital-dreams',
    title: 'Digital Dreams',
    image: titlePoster('digital-dreams'),
    rating: 8.3,
    type: 'series',
    description:
      'In a city where memories can be streamed, a dream archivist discovers footage of a crime that has not happened yet.',
    genre: 'Drama',
    maturityRating: 16,
    cast: ['layla-baker', 'davids-valentino', 'nnena-kasim'],
    isAiGenerated: true,
  },
  {
    id: 'synthetic-hearts',
    slug: 'synthetic-hearts',
    title: 'Synthetic Hearts',
    image: titlePoster('synthetic-hearts'),
    rating: 8.7,
    type: 'movie',
    description:
      'Two android companions develop emotions their designers insist are impossible, forcing a corporation to choose profit or personhood.',
    genre: 'Drama',
    maturityRating: 13,
    cast: ['clara-christopher', 'spencer-hawk', 'nicolas-martinez'],
    isAiGenerated: true,
  },
  {
    id: 'parallax-universe',
    slug: 'parallax-universe',
    title: 'Parallax Universe',
    image: titlePoster('parallax-universe'),
    rating: 8.4,
    type: 'movie',
    description:
      'A starship crew drifting between timelines must decide which version of humanity is worth saving when all of them are real.',
    genre: 'Sci-Fi',
    maturityRating: 13,
    cast: ['cho-ichiro', 'lora-adams', 'davis-blake'],
    isAiGenerated: false,
  },
  {
    id: 'ai-genesis',
    slug: 'ai-genesis',
    title: 'AI Genesis',
    image: titlePoster('ai-genesis'),
    rating: 8.9,
    type: 'movie',
    description:
      'The first film entirely directed by an artificial intelligence becomes a global phenomenon — and a mirror no one wants to look into.',
    genre: 'Sci-Fi',
    maturityRating: 16,
    cast: ['fiona-matthew', 'clark-sylvester', 'sapphire-paggie'],
    isAiGenerated: true,
  },
  {
    id: 'neural-stories',
    slug: 'neural-stories',
    title: 'Neural Stories',
    image: titlePoster('neural-stories'),
    rating: 8.6,
    type: 'series',
    description:
      'Anthology series where each episode is generated from the collective dreams of a sleeping city, with terrifying overlap between viewers.',
    genre: 'Sci-Fi',
    maturityRating: 16,
    cast: ['nnena-kasim', 'henry-uchenna', 'sandra-rosewood'],
    isAiGenerated: true,
  },
  {
    id: 'algorithmic-dreams',
    slug: 'algorithmic-dreams',
    title: 'Algorithmic Dreams',
    image: titlePoster('algorithmic-dreams'),
    rating: 8.4,
    type: 'movie',
    description:
      'A recommendation engine so accurate it predicts heartbreak becomes the most downloaded app on earth — until it starts changing outcomes.',
    genre: 'Thriller',
    maturityRating: 13,
    cast: ['cho-ichiro', 'layla-baker', 'davids-valentino'],
    isAiGenerated: true,
  },
  {
    id: 'synthetic-worlds',
    slug: 'synthetic-worlds',
    title: 'Synthetic Worlds',
    image: titlePoster('synthetic-worlds'),
    rating: 8.8,
    type: 'movie',
    description:
      'Virtual tourists trapped inside a perfect resort simulation realize the exit was removed the moment they stopped wanting to leave.',
    genre: 'Sci-Fi',
    maturityRating: 16,
    cast: ['clara-christopher', 'nicolas-martinez', 'spencer-hawk'],
    isAiGenerated: true,
  },
  {
    id: 'data-consciousness',
    slug: 'data-consciousness',
    title: 'Data Consciousness',
    image: titlePoster('data-consciousness'),
    rating: 8.7,
    type: 'movie',
    description:
      'A dying programmer uploads her mind into a cloud archive, only to discover thousands of other selves already waiting inside.',
    genre: 'Drama',
    maturityRating: 16,
    cast: ['lora-adams', 'davis-blake', 'fiona-matthew'],
    isAiGenerated: true,
  },
];

export const trendingMovies = allTitles.filter((title) =>
  [
    'nexus-protocol',
    'cipher-origins',
    'quantum-void',
    'digital-dreams',
    'synthetic-hearts',
    'parallax-universe',
    'ai-genesis',
    'data-consciousness',
  ].includes(
    title.slug
  )
);

export const aiMovies = allTitles.filter((title) => title.isAiGenerated);

export const continueWatching: ContinueWatchingItem[] = [
  {
    ...allTitles.find((title) => title.slug === 'ashes-to-crown')!,
    progress: 62,
    episodeLabel: 'Episode 5',
  },
  {
    ...allTitles.find((title) => title.slug === 'nexus-protocol')!,
    progress: 34,
  },
  {
    ...allTitles.find((title) => title.slug === 'digital-dreams')!,
    progress: 48,
    episodeLabel: 'Season 2',
  },
  {
    ...allTitles.find((title) => title.slug === 'synthetic-hearts')!,
    progress: 88,
  },
  {
    ...allTitles.find((title) => title.slug === 'cipher-origins')!,
    progress: 21,
  },
  {
    ...allTitles.find((title) => title.slug === 'parallax-universe')!,
    progress: 57,
  },
  {
    ...allTitles.find((title) => title.slug === 'ai-genesis')!,
    progress: 41,
  },
  {
    ...allTitles.find((title) => title.slug === 'data-consciousness')!,
    progress: 29,
  },
];

export const creators: Creator[] = [
  {
    id: 'cr1',
    name: 'Alex Nova',
    image: creatorAvatar('cr1'),
    followers: '2.5M',
    specialization: 'Sci-Fi Cinema',
  },
  {
    id: 'cr2',
    name: 'Maya Chen',
    image: creatorAvatar('cr2'),
    followers: '1.8M',
    specialization: 'AI Narratives',
  },
  {
    id: 'cr3',
    name: 'Isaac Moore',
    image: creatorAvatar('cr3'),
    followers: '3.2M',
    specialization: 'Tech Thrillers',
  },
  {
    id: 'cr4',
    name: 'Sophia Rivers',
    image: creatorAvatar('cr4'),
    followers: '2.1M',
    specialization: 'Futurism',
  },
];

export const communityPosts = [
  {
    id: '1',
    author: 'Alex Nova',
    avatar: creatorAvatar('cr1'),
    content: 'Just finished Nexus Protocol. Mind blown! The AI performances were incredibly natural.',
    timestamp: '2 hours ago',
    likes: 342,
    comments: 45,
    image: titlePoster('nexus-protocol'),
  },
  {
    id: '2',
    author: 'Maya Chen',
    avatar: creatorAvatar('cr2'),
    content: 'The new AI Generated Originals on XORAL are absolutely stunning. This is the future of cinema!',
    timestamp: '4 hours ago',
    likes: 567,
    comments: 89,
  },
  {
    id: '3',
    author: 'Isaac Moore',
    avatar: creatorAvatar('cr3'),
    content: 'Watching Cipher Origins again. Every scene is a masterpiece. The cinematography is insane.',
    timestamp: '6 hours ago',
    likes: 234,
    comments: 32,
    image: titlePoster('cipher-origins'),
  },
];

export const genres = ['All Genres', 'Sci-Fi', 'Thriller', 'Drama', 'Action'];
