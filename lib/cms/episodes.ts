export type CmsEpisode = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl?: string;
  trailerUrl?: string;
  durationMinutes?: number;
  published: boolean;
};

export type CmsSeason = {
  id: string;
  seasonNumber: number;
  title?: string;
  description?: string;
  episodes: CmsEpisode[];
};

/** Stable key for playback progress (localStorage). */
export function episodeProgressKey(showSlug: string, season: number, episode: number) {
  return `${showSlug}-s${season}e${episode}`;
}

export function getDefaultEpisode(seasons: CmsSeason[]): CmsEpisode | null {
  for (const season of seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)) {
    const ep = season.episodes
      .filter((e) => e.published && e.videoUrl)
      .sort((a, b) => a.episodeNumber - b.episodeNumber)[0];
    if (ep) return ep;
  }
  return seasons[0]?.episodes[0] ?? null;
}

export function findEpisode(
  seasons: CmsSeason[],
  seasonNumber: number,
  episodeNumber: number
): CmsEpisode | null {
  const season = seasons.find((s) => s.seasonNumber === seasonNumber);
  return season?.episodes.find((e) => e.episodeNumber === episodeNumber) ?? null;
}
