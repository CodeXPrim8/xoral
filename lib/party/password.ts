import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function nid(prefix: string) {
  return `${prefix}_${randomBytes(6).toString('hex')}`;
}

export function makeSalesCode(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 6) || 'xoral';
  return `${base}${randomBytes(2).toString('hex')}`.slice(0, 10);
}
