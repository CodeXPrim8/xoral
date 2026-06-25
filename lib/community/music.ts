export type CommunityMusicTrack = {
  id: string;
  title: string;
  artist: string;
  url: string;
};

/** Royalty-free preview tracks (Mixkit) — used as background music in posts/shorts */
export const COMMUNITY_MUSIC_TRACKS: CommunityMusicTrack[] = [
  {
    id: 'tech-house',
    title: 'Tech House Vibes',
    artist: 'Mixkit',
    url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
  },
  {
    id: 'hip-hop',
    title: 'Hip Hop Story',
    artist: 'Mixkit',
    url: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3',
  },
  {
    id: 'lofi',
    title: 'Lo-Fi Chill',
    artist: 'Mixkit',
    url: 'https://assets.mixkit.co/music/preview/mixkit-lo-fi-chill-1180.mp3',
  },
  {
    id: 'cinematic',
    title: 'Cinematic Drama',
    artist: 'Mixkit',
    url: 'https://assets.mixkit.co/music/preview/mixkit-cinematic-epic-orchestra-207.mp3',
  },
  {
    id: 'ambient',
    title: 'Ambient Waves',
    artist: 'Mixkit',
    url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
  },
];

export function getMusicTrack(id: string) {
  return COMMUNITY_MUSIC_TRACKS.find((track) => track.id === id);
}
