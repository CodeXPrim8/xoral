import { NextRequest, NextResponse } from 'next/server';
import { COOKIE, fail } from '@/lib/xoral-social/http';
import { loginUser, registerUser, withDb } from '@/lib/xoral-social/store';

function withSession(payload: object, token: string) {
  const res = NextResponse.json(payload);
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || '');
  try {
    if (action === 'register') {
      const { user, token } = await withDb((db) => {
        const created = registerUser(db, {
          name: String(body.name || ''),
          handle: String(body.handle || ''),
          password: String(body.password || ''),
          gender: body.gender === 'male' ? 'male' : 'female',
        });
        return loginUser(db, created.handle, String(body.password || ''));
      });
      return withSession({ ok: true, user: { id: user.id, handle: user.handle, name: user.name } }, token);
    }
    if (action === 'login') {
      const { user, token } = await withDb((db) => loginUser(db, String(body.handle || ''), String(body.password || '')));
      return withSession({ ok: true, user: { id: user.id, handle: user.handle, name: user.name } }, token);
    }
    if (action === 'logout') {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
      return res;
    }
    return fail('Unknown action');
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Auth failed');
  }
}
