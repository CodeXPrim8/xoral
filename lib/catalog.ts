import { characters } from './characters';
import { allTitles, continueWatching, heroContent } from './data';
import type { CatalogSnapshot } from './cms/catalog';
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

export type BrowseTypeFilter = 'all' | 'movie' | 'series';

export function filterTitles(options: {
  query?: string;
  genre?: string;
  sort?: string;
  type?: BrowseTypeFilter;
}) {
  let results = [...allTitles];

  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter((title) => title.title.toLowerCase().includes(q));
  }

  if (options.type === 'movie') {
    results = results.filter((title) => title.type === 'movie' || title.type === 'ai');
  } else if (options.type === 'series') {
    results = results.filter((title) => title.type === 'series');
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

export function getCastForTitleInCatalog(catalog: CatalogSnapshot, slug: string): Character[] {
  const title = catalog.titles.find((item) => item.slug === slug);
  if (!title) return [];
  return title.cast
    .map((id) => catalog.characters.find((character) => character.id === id))
    .filter((character): character is Character => Boolean(character));
}

export function getTitlesByCharacterIdInCatalog(catalog: CatalogSnapshot, characterId: string): Title[] {
  return catalog.titles.filter((title) => title.cast.includes(characterId));
}

export function getCharacterAppearancesInCatalog(catalog: CatalogSnapshot, characterId: string) {
  return getTitlesByCharacterIdInCatalog(catalog, characterId).length;
}

export function searchCatalogTitles(catalog: CatalogSnapshot, query: string): Title[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return catalog.titles.filter((title) => {
    const castNames = title.cast
      .map((id) => catalog.characters.find((character) => character.id === id)?.name.toLowerCase() ?? '')
      .join(' ');
    return (
      title.title.toLowerCase().includes(normalized) ||
      title.genre.toLowerCase().includes(normalized) ||
      title.description.toLowerCase().includes(normalized) ||
      castNames.includes(normalized)
    );
  });
}

export function filterCatalogTitles(
  catalog: CatalogSnapshot,
  options: { query?: string; genre?: string; sort?: string; type?: BrowseTypeFilter }
) {
  let results = [...catalog.titles];

  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter((title) => title.title.toLowerCase().includes(q));
  }

  if (options.type === 'movie') {
    results = results.filter((title) => title.type === 'movie' || title.type === 'ai');
  } else if (options.type === 'series') {
    results = results.filter((title) => title.type === 'series');
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
