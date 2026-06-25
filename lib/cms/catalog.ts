import type { Character, ContentType, ContinueWatchingItem, Creator, Title } from '@/lib/types';
import type { CmsSeason } from '@/lib/cms/episodes';
import { getDefaultEpisode } from '@/lib/cms/episodes';
import {
  allTitles as staticTitles,
  aiMovies as staticAiMovies,
  continueWatching as staticContinueWatching,
  creators as staticCreators,
  heroContent as staticHero,
  trendingMovies as staticTrending,
} from '@/lib/data';
import { characters as staticCharacters } from '@/lib/characters';
import { isLegacyHeroSchemaError } from '@/lib/cms/hero-schema';

export type HeroContent = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  rating: number;
  category: string;
  image: string;
  subtitle?: string;
  videoUrl?: string;
  trailerUrl?: string;
};

function heroFromTitle(
  heroTitle: Title | undefined,
  overrides: {
    id?: number;
    slug?: string;
    title?: string;
    description?: string;
    rating?: number;
    category?: string;
    image?: string;
    subtitle?: string | null;
  }
): HeroContent {
  return {
    id: overrides.id,
    slug: overrides.slug ?? heroTitle?.slug ?? staticHero.slug,
    title: overrides.title ?? heroTitle?.title ?? staticHero.title,
    description: overrides.description ?? heroTitle?.description ?? staticHero.description,
    rating: overrides.rating ?? staticHero.rating,
    category: overrides.category ?? heroTitle?.genre ?? staticHero.category,
    image: overrides.image ?? heroTitle?.image ?? staticHero.image,
    subtitle: overrides.subtitle ?? heroTitle?.subtitle ?? staticHero.subtitle,
    videoUrl: heroTitle?.videoUrl,
    trailerUrl: heroTitle?.trailerUrl,
  };
}

export type CatalogSnapshot = {
  source: 'cms' | 'static';
  titles: Title[];
  characters: Character[];
  creators: Creator[];
  heroes: HeroContent[];
  hero: HeroContent;
  trending: Title[];
  continueWatching: ContinueWatchingItem[];
  aiMovies: Title[];
  nextWatch: ContinueWatchingItem[];
};

type CmsHeroRow = {
  id: number;
  title_slug: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  rating: number;
  category: string;
  sort_order?: number | null;
  is_active?: boolean | null;
};

type CmsTitleRow = {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  rating: number;
  type: ContentType;
  description: string;
  genre: string;
  maturity_rating: number;
  is_ai_generated: boolean;
  subtitle: string | null;
  trailer_url: string | null;
  video_url: string | null;
  published: boolean;
  cms_title_cast?: { cms_characters: { slug: string } | null }[];
};

type CmsCharacterRow = {
  id: string;
  slug: string;
  name: string;
  gender: 'male' | 'female';
  age: number | null;
  nationality: string;
  height: string;
  eyes: string;
  hair: string;
  personality: string;
  style: string;
  voice: string;
  profession: string;
  skin_color: string;
  description: string;
  image_url: string;
};

function mapCharacter(row: CmsCharacterRow): Character {
  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    gender: row.gender,
    age: row.age ?? undefined,
    nationality: row.nationality,
    height: row.height,
    eyes: row.eyes,
    hair: row.hair,
    personality: row.personality,
    style: row.style,
    voice: row.voice,
    profession: row.profession,
    skinColor: row.skin_color,
    image: row.image_url,
    description: row.description,
  };
}

function mapTitle(row: CmsTitleRow, seasons: CmsSeason[] = []): Title {
  const cast =
    row.cms_title_cast
      ?.map((entry) => entry.cms_characters?.slug)
      .filter((slug): slug is string => Boolean(slug)) ?? [];

  const title: Title = {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    image: row.image_url,
    rating: Number(row.rating),
    type: row.type,
    description: row.description,
    genre: row.genre,
    maturityRating: row.maturity_rating,
    cast,
    isAiGenerated: row.is_ai_generated,
    subtitle: row.subtitle ?? undefined,
    trailerUrl: row.trailer_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
  };

  if (row.type === 'series' && seasons.length > 0) {
    title.seasons = seasons;
    const firstEp = getDefaultEpisode(seasons);
    if (firstEp?.videoUrl && !title.videoUrl) title.videoUrl = firstEp.videoUrl;
    if (firstEp?.trailerUrl && !title.trailerUrl) title.trailerUrl = firstEp.trailerUrl;
  }

  return title;
}

type CmsSeasonRow = {
  id: string;
  title_id: string;
  season_number: number;
  title: string | null;
  description: string | null;
  cms_episodes?: {
    id: string;
    episode_number: number;
    title: string;
    description: string;
    video_url: string | null;
    trailer_url: string | null;
    duration_minutes: number | null;
    published: boolean;
  }[];
};

function mapSeasonRows(rows: CmsSeasonRow[]): Map<string, CmsSeason[]> {
  const byTitle = new Map<string, CmsSeason[]>();

  for (const row of rows) {
    const season: CmsSeason = {
      id: row.id,
      seasonNumber: row.season_number,
      title: row.title ?? undefined,
      description: row.description ?? undefined,
      episodes: (row.cms_episodes ?? [])
        .filter((ep) => ep.published)
        .sort((a, b) => a.episode_number - b.episode_number)
        .map((ep) => ({
          id: ep.id,
          seasonNumber: row.season_number,
          episodeNumber: ep.episode_number,
          title: ep.title,
          description: ep.description,
          videoUrl: ep.video_url ?? undefined,
          trailerUrl: ep.trailer_url ?? undefined,
          durationMinutes: ep.duration_minutes ?? undefined,
          published: ep.published,
        })),
    };

    const list = byTitle.get(row.title_id) ?? [];
    list.push(season);
    byTitle.set(row.title_id, list);
  }

  for (const [key, list] of byTitle) {
    byTitle.set(
      key,
      list.sort((a, b) => a.seasonNumber - b.seasonNumber)
    );
  }

  return byTitle;
}

function mapHeroRows(rows: CmsHeroRow[], titles: Title[]): HeroContent[] {
  const titleBySlug = new Map(titles.map((title) => [title.slug, title]));
  const fallbackTitle = titles[0];

  return rows
    .filter((row) => row.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
    .map((row) => {
      const heroTitle = row.title_slug ? titleBySlug.get(row.title_slug) : undefined;
      const baseTitle = heroTitle ?? fallbackTitle;
      if (!baseTitle) return null;
      return heroFromTitle(baseTitle, {
        id: row.id,
        slug: baseTitle.slug,
        title: baseTitle.title,
        description: row.description ?? baseTitle.description,
        rating: row.rating ?? undefined,
        category: row.category ?? baseTitle.genre,
        image: row.image_url ?? baseTitle.image,
        subtitle: row.subtitle,
      });
    })
    .filter((hero): hero is HeroContent => Boolean(hero));
}

function buildStaticHeroes(): HeroContent[] {
  const staticHeroTitle = staticTitles.find((title) => title.slug === staticHero.slug);
  const primary = heroFromTitle(staticHeroTitle, {
    slug: staticHero.slug,
    title: staticHero.title,
    description: staticHero.description,
    rating: staticHero.rating,
    category: staticHero.category,
    image: staticHero.image,
    subtitle: staticHero.subtitle,
  });

  const extraSlugs = staticTrending
    .map((title) => title.slug)
    .filter((slug) => slug !== primary.slug)
    .slice(0, 2);

  const extras = extraSlugs
    .map((slug) => staticTitles.find((title) => title.slug === slug))
    .filter((title): title is Title => Boolean(title))
    .map((title) =>
      heroFromTitle(title, {
        slug: title.slug,
        title: title.title,
        description: title.description,
        rating: title.maturityRating,
        category: title.genre,
        image: title.image,
        subtitle: title.subtitle,
      })
    );

  return [primary, ...extras];
}

export function getStaticCatalog(): CatalogSnapshot {
  const heroes = buildStaticHeroes();

  return {
    source: 'static',
    titles: staticTitles,
    characters: staticCharacters,
    creators: staticCreators,
    heroes,
    hero: heroes[0],
    trending: staticTrending,
    continueWatching: staticContinueWatching,
    aiMovies: staticAiMovies,
    nextWatch: staticContinueWatching,
  };
}

function sortByRating(titles: Title[]): Title[] {
  return [...titles].sort((a, b) => b.rating - a.rating);
}

function defaultTrending(titles: Title[]): Title[] {
  return sortByRating(titles);
}

function defaultAiMovies(titles: Title[]): Title[] {
  const aiTitles = titles.filter((title) => title.isAiGenerated || title.type === 'ai');
  return aiTitles.length > 0 ? sortByRating(aiTitles) : sortByRating(titles);
}

function defaultNextWatch(titles: Title[]): ContinueWatchingItem[] {
  return sortByRating(titles)
    .slice(0, 8)
    .map((title, index) => ({
      ...title,
      progress: Math.min(85, 25 + index * 10),
      episodeLabel: title.type === 'series' ? `Episode ${index + 1}` : undefined,
    }));
}

function withSectionFallback(
  fromSection: ContinueWatchingItem[],
  fallback: ContinueWatchingItem[]
): ContinueWatchingItem[] {
  return fromSection.length > 0 ? fromSection : fallback;
}

function withTitleFallback(fromSection: Title[], fallback: Title[]): Title[] {
  return fromSection.length > 0 ? fromSection : fallback;
}

export function findTitleInCatalog(catalog: CatalogSnapshot, slug: string): Title | undefined {
  const normalized = decodeURIComponent(slug).trim();
  const pools: Title[][] = [
    catalog.titles,
    catalog.trending,
    catalog.continueWatching,
    catalog.aiMovies,
    catalog.nextWatch,
  ];

  for (const pool of pools) {
    const match = pool.find((item) => item.slug === normalized);
    if (match) return match;
  }

  return undefined;
}

export function mergeCatalogSnapshots(base: CatalogSnapshot, overlay: CatalogSnapshot): CatalogSnapshot {
  const titleBySlug = new Map<string, Title>();
  for (const title of base.titles) titleBySlug.set(title.slug, title);
  for (const title of overlay.titles) titleBySlug.set(title.slug, title);

  for (const pool of [overlay.trending, overlay.continueWatching, overlay.aiMovies, overlay.nextWatch]) {
    for (const title of pool) {
      if (!titleBySlug.has(title.slug)) titleBySlug.set(title.slug, title);
    }
  }

  return {
    ...overlay,
    titles: Array.from(titleBySlug.values()),
  };
}

export function finalizeCatalogSnapshot(snapshot: CatalogSnapshot): CatalogSnapshot {
  const titleBySlug = new Map<string, Title>();
  for (const title of snapshot.titles) titleBySlug.set(title.slug, title);
  for (const pool of [snapshot.trending, snapshot.continueWatching, snapshot.aiMovies, snapshot.nextWatch]) {
    for (const title of pool) {
      if (!titleBySlug.has(title.slug)) titleBySlug.set(title.slug, title);
    }
  }

  return {
    ...snapshot,
    titles: Array.from(titleBySlug.values()),
    heroes: snapshot.heroes?.length ? snapshot.heroes : snapshot.hero ? [snapshot.hero] : [],
    hero: snapshot.heroes?.[0] ?? snapshot.hero,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchCatalogFromCms(supabase: any): Promise<CatalogSnapshot | null> {
  const { count, error: countError } = await supabase
    .from('cms_titles')
    .select('*', { count: 'exact', head: true });

  if (countError?.code === 'PGRST205' || !count) {
    return null;
  }

  const [
    { data: titleRows },
    { data: characterRows },
    { data: creatorRows },
    { data: sectionItems },
    { data: seasonRows, error: seasonsError },
  ] = await Promise.all([
    supabase
      .from('cms_titles')
      .select('*, cms_title_cast(cms_characters(slug))')
      .eq('published', true)
      .order('title'),
    supabase.from('cms_characters').select('*').eq('published', true).order('name'),
    supabase.from('cms_creators').select('*').eq('published', true).order('sort_order'),
    supabase
      .from('cms_section_items')
      .select('section_id, sort_order, progress, episode_label, cms_titles(*)')
      .order('sort_order'),
    supabase
      .from('cms_seasons')
      .select('*, cms_episodes(*)')
      .order('season_number'),
  ]);

  let heroRows: CmsHeroRow[] | null = null;
  let heroFetch = await supabase.from('cms_hero').select('*').order('sort_order').order('id');
  if (isLegacyHeroSchemaError(heroFetch.error)) {
    heroFetch = await supabase.from('cms_hero').select('*').order('id');
  }
  heroRows = (heroFetch.data as CmsHeroRow[] | null) ?? null;

  const seasonsByTitleId =
    seasonsError?.code === 'PGRST205' ? new Map<string, CmsSeason[]>() : mapSeasonRows((seasonRows as CmsSeasonRow[] | null) ?? []);

  const titles =
    (titleRows as CmsTitleRow[] | null)?.map((row) =>
      mapTitle(row, seasonsByTitleId.get(row.id) ?? [])
    ) ?? [];
  const titleBySlug = new Map(titles.map((title) => [title.slug, title]));

  const heroes = mapHeroRows(heroRows ?? [], titles);
  const hero =
    heroes[0] ??
    heroFromTitle(titles[0], {
      slug: titles[0]?.slug,
      title: titles[0]?.title,
    });

  function sectionTitles(sectionId: string, withProgress = false): ContinueWatchingItem[] {
    const items =
      sectionItems
        ?.filter((item: { section_id: string }) => item.section_id === sectionId)
        .filter((item: { cms_titles: CmsTitleRow | null }) => item.cms_titles?.published)
        .map((item: {
          progress: number | null;
          episode_label: string | null;
          cms_titles: CmsTitleRow;
        }) => {
          const mapped = mapTitle(
            item.cms_titles,
            seasonsByTitleId.get(item.cms_titles.id) ?? []
          );
          if (!withProgress) return mapped as ContinueWatchingItem;
          return {
            ...mapped,
            progress: item.progress ?? 0,
            episodeLabel: item.episode_label ?? undefined,
          };
        }) ?? [];
    return items;
  }

  const mappedCharacters = (characterRows as CmsCharacterRow[] | null)?.map(mapCharacter) ?? [];
  const mappedCreators =
    creatorRows?.map((row: {
      slug: string;
      name: string;
      image_url: string;
      followers: string;
      specialization: string;
    }) => ({
      id: row.slug,
      name: row.name,
      image: row.image_url,
      followers: row.followers,
      specialization: row.specialization,
    })) ?? [];

  const trendingFromSection = sectionTitles('trending');
  const nextWatchFromSection = sectionTitles('next_watch', true);
  const aiFromSection = sectionTitles('ai_originals');
  const fallbackNextWatch = defaultNextWatch(titles);
  const fallbackTrending = defaultTrending(titles);
  const fallbackAi = defaultAiMovies(titles);

  return finalizeCatalogSnapshot({
    source: 'cms',
    titles,
    characters: mappedCharacters.length > 0 ? mappedCharacters : staticCharacters,
    creators: mappedCreators.length > 0 ? mappedCreators : staticCreators,
    heroes: heroes.length > 0 ? heroes : [hero],
    hero,
    trending: withTitleFallback(trendingFromSection, fallbackTrending),
    continueWatching: withSectionFallback(nextWatchFromSection, fallbackNextWatch),
    aiMovies: withTitleFallback(aiFromSection, fallbackAi),
    nextWatch: withSectionFallback(nextWatchFromSection, fallbackNextWatch),
  });
}
