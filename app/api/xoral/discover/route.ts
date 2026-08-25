import { NextResponse } from 'next/server';
import { readUser } from '@/lib/xoral-social/http';
import { toPublic, withDb } from '@/lib/xoral-social/store';

export async function GET() {
  const me = await readUser();
  const people = await withDb((db) => {
    const following = new Set(me ? db.follows.filter((f) => f.followerId === me.id).map((f) => f.followingId) : []);
    const characters = db.users.filter((u) => u.isCharacter).map((u) => ({ ...toPublic(db, u), followedByMe: following.has(u.id) }));
    const real = db.users
      .filter((u) => u.world === 'real' && !u.isCharacter && u.id !== me?.id && u.passwordHash === '')
      .slice(0, 24)
      .map((u) => ({ ...toPublic(db, u), followedByMe: following.has(u.id) }));
    const xoral = db.users
      .filter((u) => u.world === 'xoral' && !u.isCharacter)
      .slice(0, 24)
      .map((u) => ({ ...toPublic(db, u), followedByMe: following.has(u.id) }));
    return { characters, real, xoral };
  });
  return NextResponse.json(people);
}
