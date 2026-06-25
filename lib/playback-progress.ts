const STORAGE_KEY = 'xoral_playback_progress';

type ProgressEntry = {
  seconds: number;
  updatedAt: number;
};

type ProgressMap = Record<string, ProgressEntry>;

function readMap(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: ProgressMap) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getPlaybackPosition(slug: string): number {
  const entry = readMap()[slug];
  return entry?.seconds ?? 0;
}

export function savePlaybackPosition(slug: string, seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return;
  const map = readMap();
  map[slug] = { seconds, updatedAt: Date.now() };
  writeMap(map);
}

export function clearPlaybackPosition(slug: string) {
  const map = readMap();
  delete map[slug];
  writeMap(map);
}

/** Resume time in seconds — prefers saved position, then catalog progress percent. */
export function getResumeSeconds(
  slug: string,
  duration: number,
  progressPercent = 0
): number {
  const saved = getPlaybackPosition(slug);
  if (saved > 1) return Math.min(saved, Math.max(0, duration - 1));

  if (progressPercent > 0 && duration > 0) {
    return Math.min((progressPercent / 100) * duration, Math.max(0, duration - 1));
  }

  return 0;
}
