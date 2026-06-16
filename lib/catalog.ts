import { characters } from './characters';
import { allTitles, continueWatching, heroContent } from './data';
import type { Character, Title } from './types';

export function getAllTitles(): Title[] {
  return allTitles;
}

export function getTitleBySlug(slug: string): Title | undefined {
  return allTitles.find((title) => title.slug === slug);
}

export function getTitlesByCharacterId(characterId: string): Title[] {
  return allTitles.filter((title) => title.cast.includes(characterId));
}

export function getCharacterAppearances(characterId: string) {
  return getTitlesByCharacterId(characterId).length;
}

export function getCastForTitle(slug: string): Character[] {
  const title = getTitleBySlug(slug);
  if (!title) return [];
  return title.cast
    .map((id) => characters.find((character) => character.id === id))
    .filter((character): character is Character => Boolean(character));
}

export function searchTitles(query: string): Title[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return allTitles.filter((title) => {
    const castNames = title.cast
      .map((id) => characters.find((character) => character.id === id)?.name.toLowerCase() ?? '')
      .join(' ');
    return (
      title.title.toLowerCase().includes(normalized) ||
      title.genre.toLowerCase().includes(normalized) ||
      title.description.toLowerCase().includes(normalized) ||
      castNames.includes(normalized)
    );
  });
}

export function filterTitles(options: {
  query?: string;
  genre?: string;
  sort?: string;
}) {
  let results = [...allTitles];

  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter((title) => title.title.toLowerCase().includes(q));
  }

  if (options.genre && options.genre !== 'All Genres') {
    results = results.filter((title) => title.genre === options.genre);
  }

  switch (options.sort) {
    case 'Most Popular':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'Highest Rated':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'Trending':
      results.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'Latest':
    default:
      results.reverse();
      break;
  }

  return results;
}

export { continueWatching, heroContent };
