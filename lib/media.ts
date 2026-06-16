/** Local XORAL-owned asset paths — no external image URLs */

export function titlePoster(slug: string) {
  return `/posters/${slug}.svg`;
}

export function characterAvatar(slug: string) {
  return `/avatars/${slug}.svg`;
}

export function creatorAvatar(id: string) {
  return `/creators/${id}.svg`;
}

export const XORAL_HERO = '/posters/xoral-hero.svg';
