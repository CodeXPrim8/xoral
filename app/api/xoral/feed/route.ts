import { NextRequest, NextResponse } from 'next/server';
import { readUser } from '@/lib/xoral-social/http';
import { toPublic, viewPost, withDb } from '@/lib/xoral-social/store';

export async function GET(request: NextRequest) {
  const me = await readUser();
  const tab = request.nextUrl.searchParams.get('tab') || 'feed';
  const data = await withDb((db) => {
    const now = Date.now();
    if (tab === 'stories') {
      const stories = db.stories
        .filter((s) => s.expiresAt > now)
        .map((s) => ({
          ...s,
          author: toPublic(db, db.users.find((u) => u.id === s.authorId)!),
        }));
      return { stories };
    }
    if (tab === 'reels') {
      const reels = db.posts
        .filter((p) => p.kind === 'reel')
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 24)
        .map((p) => viewPost(db, p, me?.id));
      return { posts: reels };
    }
    if (tab === 'live') {
      const lives = db.lives
        .filter((l) => !l.endedAt)
        .map((l) => ({
          ...l,
          host: toPublic(db, db.users.find((u) => u.id === l.hostId)!),
          chats: db.liveChats
            .filter((c) => c.liveId === l.id)
            .slice(-30)
            .map((c) => ({
              ...c,
              author: toPublic(db, db.users.find((u) => u.id === c.authorId)!),
            })),
        }));
      return { lives, canGoLive: me ? toPublic(db, me).canGoLive : false, me: me ? toPublic(db, me) : null };
    }
    const posts = db.posts
      .filter((p) => p.kind === 'post')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 40)
      .map((p) => viewPost(db, p, me?.id));
    const stories = db.stories
      .filter((s) => s.expiresAt > now)
      .slice(0, 24)
      .map((s) => ({
        ...s,
        author: toPublic(db, db.users.find((u) => u.id === s.authorId)!),
      }));
    return { posts, stories, me: me ? toPublic(db, me) : null };
  });
  return NextResponse.json(data);
}
