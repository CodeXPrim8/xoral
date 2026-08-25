'use client';

export type ClemxPhoto = { id: string; src: string; createdAt: number };
export type ClemxNote = { id: string; title: string; body: string; updatedAt: number };

const PHOTOS_KEY = 'clemx-photos';
const NOTES_KEY = 'clemx-notes';
const SHARE_KEY = 'clemx-share-xoral';
const MAX_PHOTOS = 24;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readPhotos(): ClemxPhoto[] {
  return readJson<ClemxPhoto[]>(PHOTOS_KEY, []);
}

export function savePhoto(src: string) {
  const next: ClemxPhoto[] = [{ id: `ph_${Date.now()}`, src, createdAt: Date.now() }, ...readPhotos()].slice(0, MAX_PHOTOS);
  try {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(next));
  } catch {
    try {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(next.slice(0, 8)));
    } catch { /* quota */ }
  }
  window.dispatchEvent(new Event('clemx-photos'));
}

export function compressImage(src: string, max = 960): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.68));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export function queueXoralShare(src: string, kind: 'post' | 'reel' = 'post') {
  try {
    localStorage.setItem(SHARE_KEY, JSON.stringify({ src, kind }));
  } catch { /* ignore */ }
}

export function takeXoralShare(): { src: string; kind: 'post' | 'reel' } | null {
  try {
    const raw = localStorage.getItem(SHARE_KEY);
    if (!raw) return null;
    localStorage.removeItem(SHARE_KEY);
    if (raw.startsWith('data:') || raw.startsWith('http')) return { src: raw, kind: 'post' };
    const parsed = JSON.parse(raw) as { src?: string; kind?: string };
    if (!parsed?.src) return null;
    return { src: parsed.src, kind: parsed.kind === 'reel' ? 'reel' : 'post' };
  } catch {
    return null;
  }
}

export function readNotes(): ClemxNote[] {
  const notes = readJson<ClemxNote[]>(NOTES_KEY, []);
  if (notes.length) return notes;
  const seeded: ClemxNote = {
    id: 'n_welcome',
    title: 'Xoral Party VOL. 08',
    body: 'Xoral Party VOL. 08\n30 Sept 2026\nAmbiance, Ikeja\n\nGet there early.',
    updatedAt: Date.now(),
  };
  try {
    const legacy = localStorage.getItem('clemx-note');
    if (legacy) {
      seeded.body = legacy;
      seeded.title = legacy.split('\n')[0]?.slice(0, 40) || seeded.title;
    }
  } catch { /* ignore */ }
  return [seeded];
}

export function writeNotes(notes: ClemxNote[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch { /* ignore */ }
}

export function upsertNote(note: ClemxNote) {
  const notes = readNotes().filter((n) => n.id !== note.id);
  writeNotes([note, ...notes]);
}

export function deleteNote(id: string) {
  writeNotes(readNotes().filter((n) => n.id !== id));
}
