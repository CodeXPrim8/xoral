export const CONTENT_GENRES = [
  'Drama',
  'Film',
  'Sci-Fi',
  'Thriller',
  'Romance',
  'Action',
  'Comedy',
  'Horror',
  'Documentary',
  'Fantasy',
  'Mystery',
  'Animation',
] as const;

export type ContentGenre = (typeof CONTENT_GENRES)[number];
