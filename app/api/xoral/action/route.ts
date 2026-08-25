import { NextRequest } from 'next/server';
import { fail, readUser } from '@/lib/xoral-social/http';
import {
  addComment,
  addReply,
  addStory,
  createPost,
  endLive,
  startLive,
  toggleFollow,
  toggleLike,
  toggleRepost,
  toPublic,
  withDb,
} from '@/lib/xoral-social/store';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const me = await readUser();
  if (!me) return fail('Log in with your Xoral account to do that.', 401);
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || '');
  try {
    const result = await withDb((db) => {
      const user = db.users.find((u) => u.id === me.id);
      if (!user) throw new Error('Account not found.');
      if (action === 'post') return createPost(db, user, String(body.body || ''), body.image, body.kind === 'reel' ? 'reel' : 'post');
      if (action === 'comment') return addComment(db, user, String(body.postId || ''), String(body.body || ''));
      if (action === 'reply') return addReply(db, user, String(body.commentId || ''), String(body.body || ''));
      if (action === 'like') return { liked: toggleLike(db, user, body.targetType || 'post', String(body.targetId || '')) };
      if (action === 'repost') return { reposted: toggleRepost(db, user, String(body.postId || body.targetId || '')) };
      if (action === 'follow') return { following: toggleFollow(db, user, String(body.targetId || '')) };
      if (action === 'story') return addStory(db, user, body.image, body.body);
      if (action === 'live-start') return startLive(db, user, String(body.title || ''));
      if (action === 'live-end') return endLive(db, user);
      throw new Error('Unknown action');
    });
    const meNow = await withDb((db) => {
      const user = db.users.find((u) => u.id === me.id);
      return user ? toPublic(db, user) : null;
    });
    return NextResponse.json({ ok: true, result, me: meNow });
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Could not complete that.');
  }
}
