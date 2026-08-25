import { NextResponse } from 'next/server';
import { readUser } from '@/lib/xoral-social/http';
import { toPublic, withDb } from '@/lib/xoral-social/store';

export async function GET() {
  const me = await readUser();
  if (!me) return NextResponse.json({ items: [] });
  const items = await withDb((db) =>
    db.notifications
      .filter((n) => n.userId === me.id)
      .slice(0, 40)
      .map((n) => ({
        ...n,
        from: db.users.find((u) => u.id === n.fromId) ? toPublic(db, db.users.find((u) => u.id === n.fromId)!) : null,
      }))
  );
  return NextResponse.json({ items });
}

export async function POST() {
  const me = await readUser();
  if (!me) return NextResponse.json({ ok: true });
  await withDb((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === me.id) n.read = true;
    });
  });
  return NextResponse.json({ ok: true });
}
