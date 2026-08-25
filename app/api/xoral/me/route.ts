import { NextResponse } from 'next/server';
import { readUser } from '@/lib/xoral-social/http';
import { toPublic, withDb } from '@/lib/xoral-social/store';

export async function GET() {
  const user = await readUser();
  if (!user) return NextResponse.json({ user: null });
  const publicUser = await withDb((db) => toPublic(db, user));
  return NextResponse.json({ user: publicUser });
}
