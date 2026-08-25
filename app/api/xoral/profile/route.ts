import { NextRequest, NextResponse } from 'next/server';
import { fail, readUser } from '@/lib/xoral-social/http';
import { getProfile, withDb } from '@/lib/xoral-social/store';

export async function GET(request: NextRequest) {
  const me = await readUser();
  const id = request.nextUrl.searchParams.get('id') || '';
  const handle = request.nextUrl.searchParams.get('handle') || '';
  const key = id || handle;
  if (!key) return fail('Missing profile.', 400);
  const data = await withDb((db) => getProfile(db, key, me?.id));
  if (!data) return fail('Profile not found.', 404);
  return NextResponse.json(data);
}
