import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hydrateStore, personFromToken } from '@/lib/party/store';

export const SALES_COOKIE = 'xp_sales_sid';

export async function readSalesPerson() {
  await hydrateStore();
  const jar = await cookies();
  return personFromToken(jar.get(SALES_COOKIE)?.value);
}

export function salesCookie(token: string) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SALES_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

export function salesFail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
