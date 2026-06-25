export function titlePath(slug: string) {
  return `/title/${encodeURIComponent(slug)}`;
}

export function watchPath(slug: string, query?: Record<string, string | number>) {
  const base = `/watch/${encodeURIComponent(slug)}`;
  if (!query || Object.keys(query).length === 0) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.set(key, String(value));
  }
  return `${base}?${params.toString()}`;
}
