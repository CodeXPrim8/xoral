import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { userFromToken, withDb } from './store';
import type { XoralUser } from './types';

export const COOKIE = 'xoral_sid';

export async function readUser(): Promise<XoralUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return withDb((db) => userFromToken(db, token));
}

export function sessionCookie(token: string) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
