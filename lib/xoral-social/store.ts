import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  admireRealAndXoral,
  audienceFor,
  buildSeedPeople,
  characterUniversePost,
  feedChatLine,
  feedCommentDelayMs,
  likeDelayMs,
  maybeLike,
  roleForUser,
  sceneAudio,
  scenePhoto,
  sceneVideo,
} from './lore';
import type {
  FeedPostView,
  PublicUser,
  SocialJob,
  SocialPost,
  XoralDb,
  XoralUser,
} from './types';

const DIR = join(process.cwd(), 'data', 'xoral-social');
const FILE = join(DIR, 'db.json');
const LIVE_NEED = { followers: 100, following: 10 };

let chain: Promise<unknown> = Promise.resolve();

function emptyDb(): XoralDb {
  return {
    users: [],
    sessions: [],
    posts: [],
    comments: [],
    replies: [],
    likes: [],
    reposts: [],
    follows: [],
    stories: [],
    lives: [],
    liveChats: [],
    notifications: [],
    jobs: [],
  };
}

function load(): XoralDb {
  try {
    if (!existsSync(FILE)) return emptyDb();
    return { ...emptyDb(), ...JSON.parse(readFileSync(FILE, 'utf8')) } as XoralDb;
  } catch {
    return emptyDb();
  }
}

function save(db: XoralDb) {
  mkdirSync(DIR, { recursive: true });
  const next = JSON.stringify(db);
  try {
    if (existsSync(FILE) && readFileSync(FILE, 'utf8') === next) return;
  } catch {
    /* write a fresh copy */
  }
  writeFileSync(FILE, next);
}

export function withDb<T>(fn: (db: XoralDb) => T): Promise<T> {
  const run = chain.then(() => {
    const db = load();
    seedIfNeeded(db);
    tick(db);
    const result = fn(db);
    save(db);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function nid(prefix: string) {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}

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

function seedIfNeeded(db: XoralDb) {
  if (!db.reposts) db.reposts = [];
  if (db.users.length === 0) seedFresh(db);
  hydrateReels(db);
  hydrateFeedComments(db);
  hydrateProfileMedia(db);
}

function seedFromId(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(n);
}

function hydrateReels(db: XoralDb) {
  for (const post of db.posts) {
    if (post.kind === 'reel') post.video = sceneVideo(seedFromId(post.id));
  }
  const reels = db.posts.filter((p) => p.kind === 'reel');
  if (reels.length >= 10) return;
  const characters = db.users.filter((u) => u.isCharacter);
  if (!characters.length) return;
  const need = 10 - reels.length;
  const now = Date.now();
  for (let i = 0; i < need; i++) {
    const author = characters[i % characters.length];
    const pack = characterUniversePost(author.id, i + 77);
    db.posts.unshift({
      id: nid('p'),
      authorId: author.id,
      body: pack.body,
      image: scenePhoto(i + 77, i % 2 === 0 ? 'night' : 'fashion'),
      video: sceneVideo(i + 77),
      hashtags: pack.hashtags,
      kind: 'reel',
      createdAt: now - i * 50 * 60000,
    });
  }
}

function hydrateFeedComments(db: XoralDb) {
  const characters = db.users.filter((u) => u.isCharacter);
  const extras = db.users.filter((u) => !u.isCharacter).slice(0, 50);
  const pool = [...characters, ...extras];
  if (!pool.length) return;
  for (const post of db.posts) {
    const existing = db.comments.filter((c) => c.postId === post.id);
    if (existing.length >= 4) continue;
    const need = 4 + (seedFromId(post.id) % 4) - existing.length;
    for (let i = 0; i < need; i++) {
      const author = pool[(seedFromId(post.id) + i * 5) % pool.length];
      if (!author || author.id === post.authorId) continue;
      db.comments.push({
        id: nid('c'),
        postId: post.id,
        authorId: author.id,
        body: feedChatLine(seedFromId(post.id) + i * 11, author.id, post.body),
        createdAt: post.createdAt + (5 + i * 7) * 60000,
      });
    }
  }
}

function hydrateProfileMedia(db: XoralDb) {
  const now = Date.now();
  const stars = db.users.filter((u) => u.isCharacter);
  const extras = db.users.filter((u) => !u.isCharacter).slice(0, 18);
  for (const author of [...stars, ...extras]) {
    const mine = db.posts.filter((p) => p.authorId === author.id);
    const want = author.isCharacter ? 12 : 6;
    if (mine.length >= want) continue;
    const need = want - mine.length;
    for (let i = 0; i < need; i++) {
      const pack = characterUniversePost(author.id, seedFromId(author.id) + i + 40);
      const kinds: Array<'night' | 'fashion' | 'city' | 'food' | 'music'> = ['night', 'fashion', 'city', 'food', 'music'];
      db.posts.push({
        id: nid('p'),
        authorId: author.id,
        body: pack.body,
        image: scenePhoto(seedFromId(author.id) + i + 9, kinds[i % kinds.length]),
        video: i % 4 === 0 ? sceneVideo(seedFromId(author.id) + i) : undefined,
        hashtags: pack.hashtags,
        kind: i % 4 === 0 ? 'reel' : 'post',
        createdAt: now - (i + 2) * 47 * 60000,
      });
    }
  }
}

function seedFresh(db: XoralDb) {
  if (db.users.length > 0) return;
  const now = Date.now();
  db.users = buildSeedPeople(now);

  const characters = db.users.filter((u) => u.isCharacter);
  const real = db.users.filter((u) => u.world === 'real' && !u.isCharacter);
  const xoralNpc = db.users.filter((u) => u.world === 'xoral' && !u.isCharacter);

  for (let i = 0; i < 28; i++) {
    const author = characters[i % characters.length];
    const pack = characterUniversePost(author.id, i + 11);
    db.posts.push({
      id: nid('p'),
      authorId: author.id,
      body: pack.body,
      image: scenePhoto(i + 3, i % 2 === 0 ? 'night' : i % 3 === 0 ? 'city' : 'fashion'),
      video: i % 7 === 0 ? sceneVideo(i + 3) : undefined,
      hashtags: pack.hashtags,
      kind: i % 7 === 0 ? 'reel' : 'post',
      createdAt: now - i * 2.2 * 3600000,
    });
  }

  for (let i = 0; i < 10; i++) {
    const author = real[i];
    if (!author) continue;
    db.posts.push({
      id: nid('p'),
      authorId: author.id,
      body: i % 2 === 0
        ? 'Lagos looking expensive this week. If the other side is watching, good. See you 30 September.'
        : 'Real world dinner. Tell Xoral we still do candlelight over here.',
      image: scenePhoto(i + 40, i % 2 === 0 ? 'city' : 'food'),
      hashtags: ['LagosNights', 'XoralParty', 'Sept30'],
      kind: 'post',
      createdAt: now - (i + 1) * 3.1 * 3600000,
    });
  }

  for (const post of db.posts.slice(0, 18)) {
    const a = characters[(post.body.length + 2) % characters.length];
    const b = characters[(post.body.length + 5) % characters.length];
    if (a.id === post.authorId) continue;
    const c1 = nid('c');
    db.comments.push({
      id: c1,
      postId: post.id,
      authorId: a.id,
      body: admireRealAndXoral(post.body, a.id, 'the feed', post.body.length),
      createdAt: post.createdAt + 40 * 60000,
    });
    if (b.id !== a.id && b.id !== post.authorId) {
      db.replies.push({
        id: nid('r'),
        commentId: c1,
        authorId: b.id,
        body: admireRealAndXoral(post.body, b.id, a.name, post.body.length + 9),
        createdAt: post.createdAt + 95 * 60000,
      });
    }
  }

  for (let i = 0; i < 80; i++) {
    db.follows.push({
      followerId: real[i % real.length].id,
      followingId: characters[i % characters.length].id,
    });
    db.follows.push({
      followerId: xoralNpc[i % xoralNpc.length].id,
      followingId: characters[(i + 3) % characters.length].id,
    });
  }

  for (const c of characters) {
    db.stories.push({
      id: nid('s'),
      authorId: c.id,
      image: scenePhoto(c.id.length + 4, c.id.includes('clark') ? 'car' : c.id.includes('fiona') ? 'fashion' : 'night'),
      body: `${c.city}. Counting down to 30 September.`,
      createdAt: now - 2 * 3600000,
      expiresAt: now + 20 * 3600000,
    });
  }

  db.jobs.push({
    id: nid('j'),
    at: now + 6 * 60000,
    kind: 'universe_post',
    payload: {},
  });
}

function counts(db: XoralDb, userId: string) {
  const followerIds = db.follows.filter((f) => f.followingId === userId).map((f) => f.followerId);
  const followingIds = db.follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
  const byId = new Map(db.users.map((u) => [u.id, u]));
  const worldOf = (id: string) => byId.get(id)?.world ?? 'real';
  const followersReal = followerIds.filter((id) => worldOf(id) === 'real').length;
  const followersXoral = followerIds.filter((id) => worldOf(id) === 'xoral').length;
  const followingReal = followingIds.filter((id) => worldOf(id) === 'real').length;
  const followingXoral = followingIds.filter((id) => worldOf(id) === 'xoral').length;
  return { followersReal, followersXoral, followingReal, followingXoral };
}

export function canGoLive(db: XoralDb, userId: string) {
  const c = counts(db, userId);
  return (
    c.followersReal >= LIVE_NEED.followers &&
    c.followersXoral >= LIVE_NEED.followers &&
    c.followingReal >= LIVE_NEED.following &&
    c.followingXoral >= LIVE_NEED.following
  );
}

export function toPublic(db: XoralDb, user: XoralUser): PublicUser {
  const c = counts(db, user.id);
  const postsCount = db.posts.filter((p) => p.authorId === user.id).length;
  const audience = audienceFor(
    user.id,
    user.isCharacter,
    postsCount,
    c.followersReal + c.followersXoral,
    c.followingReal + c.followingXoral,
  );
  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    world: user.world,
    gender: user.gender,
    bio: user.bio,
    image: user.image,
    city: user.city,
    isCharacter: user.isCharacter,
    voice: user.voice,
    createdAt: user.createdAt,
    ...c,
    postsCount,
    canGoLive: canGoLive(db, user.id),
    role: roleForUser(user),
    link: user.isCharacter ? `xoral.world/${user.handle}` : undefined,
    audiencePosts: audience.posts,
    audienceFollowers: audience.followers,
    audienceFollowing: audience.following,
  };
}

function notify(
  db: XoralDb,
  userId: string,
  kind: 'reply' | 'comment' | 'like' | 'follow' | 'live',
  fromId: string,
  body: string,
  extra: { postId?: string; commentId?: string } = {}
) {
  if (userId === fromId) return;
  db.notifications.unshift({
    id: nid('n'),
    userId,
    kind,
    fromId,
    postId: extra.postId,
    commentId: extra.commentId,
    body,
    read: false,
    createdAt: Date.now(),
  });
  db.notifications = db.notifications.slice(0, 300);
}

function tick(db: XoralDb) {
  const now = Date.now();
  db.stories = db.stories.filter((s) => s.expiresAt > now);
  db.sessions = db.sessions.filter((s) => s.expiresAt > now);

  const due = db.jobs.filter((j) => j.at <= now);
  db.jobs = db.jobs.filter((j) => j.at > now);

  for (const job of due) {
    runJob(db, job);
  }

  for (const comment of db.comments) {
    if (comment.typingName) {
      const pending = db.jobs.find(
        (j) => j.kind === 'reply' && j.payload.commentId === comment.id
      );
      if (!pending || pending.at - now > 8000) comment.typingName = undefined;
    }
  }

  for (const job of db.jobs) {
    if (job.kind === 'reply' && job.at - now <= 8000 && job.at > now) {
      const comment = db.comments.find((c) => c.id === job.payload.commentId);
      const author = db.users.find((u) => u.id === job.payload.fromId);
      if (comment && author) comment.typingName = author.name.split(' ')[0];
    }
  }

  const nextUniverse = db.jobs.some((j) => j.kind === 'universe_post');
  if (!nextUniverse) {
    db.jobs.push({
      id: nid('j'),
      at: now + (8 + (now % 7)) * 60000,
      kind: 'universe_post',
      payload: {},
    });
  }
}

function runJob(db: XoralDb, job: SocialJob) {
  const now = Date.now();
  if (job.kind === 'universe_post') {
    const characters = db.users.filter((u) => u.isCharacter);
    const author = characters[now % characters.length];
    const pack = characterUniversePost(author.id, now);
    db.posts.unshift({
      id: nid('p'),
      authorId: author.id,
      body: pack.body,
      image: scenePhoto(now, now % 2 === 0 ? 'night' : 'city'),
      video: now % 11 === 0 ? sceneVideo(now) : undefined,
      hashtags: pack.hashtags,
      kind: now % 11 === 0 ? 'reel' : 'post',
      createdAt: now,
    });
    return;
  }

  if (job.kind === 'follow') {
    const { fromId, toId } = job.payload;
    if (!fromId || !toId) return;
    if (db.follows.some((f) => f.followerId === fromId && f.followingId === toId)) return;
    db.follows.push({ followerId: fromId, followingId: toId });
    const from = db.users.find((u) => u.id === fromId);
    notify(db, toId, 'follow', fromId, `${from?.name ?? 'Someone'} started following you.`);
    return;
  }

  if (job.kind === 'like') {
    const { fromId, targetId } = job.payload;
    if (!fromId || !targetId) return;
    if (db.likes.some((l) => l.userId === fromId && l.targetId === targetId && l.targetType === 'post')) return;
    db.likes.push({ userId: fromId, targetType: 'post', targetId });
    const post = db.posts.find((p) => p.id === targetId);
    const from = db.users.find((u) => u.id === fromId);
    if (post) notify(db, post.authorId, 'like', fromId, `${from?.name ?? 'Someone'} liked your post.`, { postId: post.id });
    return;
  }

  if (job.kind === 'comment') {
    const { fromId, postId, text } = job.payload;
    if (!fromId || !postId || !text) return;
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return;
    db.comments.push({
      id: nid('c'),
      postId,
      authorId: fromId,
      body: text,
      createdAt: now,
    });
    const from = db.users.find((u) => u.id === fromId);
    notify(db, post.authorId, 'comment', fromId, `${from?.name ?? 'A Xoral character'} commented on your post.`, { postId });
    return;
  }

  if (job.kind === 'reply') {
    const { fromId, commentId, postId, text } = job.payload;
    if (!fromId || !commentId || !text) return;
    const comment = db.comments.find((c) => c.id === commentId);
    if (!comment) return;
    comment.typingName = undefined;
    db.replies.push({
      id: nid('r'),
      commentId,
      authorId: fromId,
      body: text,
      createdAt: now,
    });
    const from = db.users.find((u) => u.id === fromId);
    notify(db, comment.authorId, 'reply', fromId, `${from?.name ?? 'A Xoral character'} replied: ${text.slice(0, 80)}`, {
      postId,
      commentId,
    });
    return;
  }

  if (job.kind === 'live_comment') {
    const { liveId, fromId, text } = job.payload;
    if (!liveId || !fromId || !text) return;
    const live = db.lives.find((l) => l.id === liveId && !l.endedAt);
    if (!live) return;
    db.liveChats.push({
      id: nid('lc'),
      liveId,
      authorId: fromId,
      body: text,
      createdAt: now,
    });
    live.viewers += 1 + (now % 3);
  }
}

function scheduleCharacterReaction(db: XoralDb, post: SocialPost, user: XoralUser, commentId?: string, userText?: string) {
  const seed = createHash('sha1').update(`${post.id}:${commentId ?? ''}:${Date.now()}`).digest().readUInt32BE(0);
  const characters = db.users.filter((u) => u.isCharacter && u.id !== user.id);
  const extras = db.users.filter((u) => !u.isCharacter && u.id !== user.id).slice(0, 40);
  const pool = [...characters, ...extras];
  if (!pool.length) return;
  const about = userText || post.body;

  const chatter = commentId ? 2 + (seed % 3) : 3 + (seed % 4);
  for (let i = 0; i < chatter; i++) {
    const pick = pool[(seed + i * 7) % pool.length];
    db.jobs.push({
      id: nid('j'),
      at: Date.now() + feedCommentDelayMs(seed + i, i),
      kind: 'comment',
      payload: {
        fromId: pick.id,
        postId: post.id,
        text: feedChatLine(seed + i * 13, pick.id, about),
      },
    });
  }

  if (commentId) {
    const replies = 1 + (seed % 2);
    for (let i = 0; i < replies; i++) {
      const pick = pool[(seed + 19 + i) % pool.length];
      db.jobs.push({
        id: nid('j'),
        at: Date.now() + feedCommentDelayMs(seed + 4, i) + 1500,
        kind: 'reply',
        payload: {
          fromId: pick.id,
          commentId,
          postId: post.id,
          text: feedChatLine(seed + 31 + i, pick.id, about),
        },
      });
    }
  }

  if (!commentId && maybeLike(seed + 3)) {
    const pick = pool[seed % pool.length];
    db.jobs.push({
      id: nid('j'),
      at: Date.now() + Math.min(likeDelayMs(seed), 25000),
      kind: 'like',
      payload: { fromId: pick.id, targetId: post.id },
    });
  }
}

export function registerUser(db: XoralDb, input: { name: string; handle: string; password: string; gender: 'male' | 'female' }) {
  const handle = input.handle.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 18);
  if (handle.length < 3) throw new Error('Handle must be at least 3 characters.');
  if (input.password.length < 6) throw new Error('Password must be at least 6 characters.');
  if (db.users.some((u) => u.handle === handle)) throw new Error('That handle is taken.');
  const user: XoralUser = {
    id: nid('u'),
    handle,
    name: input.name.trim().slice(0, 40) || handle,
    passwordHash: hashPassword(input.password),
    world: 'real',
    gender: input.gender,
    bio: 'Real world. Crossing over Sept 30.',
    image: '',
    city: 'Lagos',
    isCharacter: false,
    createdAt: Date.now(),
  };
  db.users.push(user);
  return user;
}

export function loginUser(db: XoralDb, handle: string, password: string) {
  const key = handle.replace(/^@/, '').toLowerCase();
  const user = db.users.find((u) => u.handle === key && u.passwordHash);
  if (!user || !verifyPassword(password, user.passwordHash)) throw new Error('Wrong handle or password.');
  const token = randomBytes(24).toString('hex');
  db.sessions.push({
    token,
    userId: user.id,
    expiresAt: Date.now() + 30 * 86400000,
  });
  return { user, token };
}

export function userFromToken(db: XoralDb, token?: string | null) {
  if (!token) return null;
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) ?? null;
}

function asPostImage(image?: unknown) {
  if (typeof image !== 'string' || image.length < 16 || image.length > 600000) return undefined;
  if (image.startsWith('data:image/') || image.startsWith('https://') || image.startsWith('/')) return image;
  return undefined;
}

export function createPost(db: XoralDb, user: XoralUser, body: string, image?: string, kind: 'post' | 'reel' = 'post') {
  const text = body.trim().slice(0, 500);
  const photo = asPostImage(image);
  if (!text && !photo) throw new Error('Write something or add a photo.');
  const hashtags = [...text.matchAll(/#([A-Za-z0-9_]+)/g)].map((m) => m[1]).slice(0, 8);
  if (!hashtags.includes('XoralParty')) hashtags.push('XoralParty');
  const post: SocialPost = {
    id: nid('p'),
    authorId: user.id,
    body: text || (kind === 'reel' ? 'Reel' : 'Photo'),
    image: photo || scenePhoto(Date.now(), /food|dinner|eat/i.test(text) ? 'food' : /car|whip/i.test(text) ? 'car' : 'night'),
    video: kind === 'reel' && !photo ? sceneVideo(Date.now()) : undefined,
    hashtags,
    kind,
    createdAt: Date.now(),
  };
  db.posts.unshift(post);
  scheduleCharacterReaction(db, post, user, undefined, text || 'photo');
  return post;
}

export function addComment(db: XoralDb, user: XoralUser, postId: string, body: string) {
  const post = db.posts.find((p) => p.id === postId);
  if (!post) throw new Error('Post not found.');
  const text = body.trim().slice(0, 280);
  if (!text) throw new Error('Write a comment.');
  const comment = {
    id: nid('c'),
    postId,
    authorId: user.id,
    body: text,
    createdAt: Date.now(),
  };
  db.comments.push(comment);
  scheduleCharacterReaction(db, post, user, comment.id, text);
  return comment;
}

export function addReply(db: XoralDb, user: XoralUser, commentId: string, body: string) {
  const comment = db.comments.find((c) => c.id === commentId);
  if (!comment) throw new Error('Comment not found.');
  const post = db.posts.find((p) => p.id === comment.postId);
  if (!post) throw new Error('Post not found.');
  const text = body.trim().slice(0, 280);
  if (!text) throw new Error('Write a reply.');
  const reply = {
    id: nid('r'),
    commentId,
    authorId: user.id,
    body: text,
    createdAt: Date.now(),
  };
  db.replies.push(reply);
  scheduleCharacterReaction(db, post, user, commentId, text);
  return reply;
}

export function toggleLike(db: XoralDb, user: XoralUser, targetType: 'post' | 'comment' | 'reply', targetId: string) {
  const i = db.likes.findIndex((l) => l.userId === user.id && l.targetType === targetType && l.targetId === targetId);
  if (i >= 0) {
    db.likes.splice(i, 1);
    return false;
  }
  db.likes.push({ userId: user.id, targetType, targetId });
  return true;
}

export function toggleRepost(db: XoralDb, user: XoralUser, postId: string) {
  if (!db.reposts) db.reposts = [];
  const i = db.reposts.findIndex((r) => r.userId === user.id && r.postId === postId);
  if (i >= 0) {
    db.reposts.splice(i, 1);
    return false;
  }
  db.reposts.push({ userId: user.id, postId });
  return true;
}

export function toggleFollow(db: XoralDb, user: XoralUser, targetId: string) {
  if (targetId === user.id) throw new Error('You cannot follow yourself.');
  const i = db.follows.findIndex((f) => f.followerId === user.id && f.followingId === targetId);
  if (i >= 0) {
    db.follows.splice(i, 1);
    return false;
  }
  db.follows.push({ followerId: user.id, followingId: targetId });
  return true;
}

export function addStory(db: XoralDb, user: XoralUser, image?: string, body?: string) {
  const story = {
    id: nid('s'),
    authorId: user.id,
    image: image || scenePhoto(Date.now(), 'portrait'),
    body,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 3600000,
  };
  db.stories.unshift(story);
  return story;
}

export function startLive(db: XoralDb, user: XoralUser, title: string) {
  if (!canGoLive(db, user.id)) {
    throw new Error('Go Live needs 100 followers in the real world and 100 in the Xoral universe, and you must follow at least 10 people in each world.');
  }
  const existing = db.lives.find((l) => l.hostId === user.id && !l.endedAt);
  if (existing) return existing;
  const live = {
    id: nid('live'),
    hostId: user.id,
    title: title.trim().slice(0, 80) || 'Live from the real world',
    startedAt: Date.now(),
    viewers: 3,
  };
  db.lives.unshift(live);
  const characters = db.users.filter((u) => u.isCharacter);
  for (let i = 0; i < 6; i++) {
    const c = characters[i];
    db.jobs.push({
      id: nid('j'),
      at: Date.now() + (40 + i * 25) * 1000,
      kind: 'live_comment',
      payload: {
        liveId: live.id,
        fromId: c.id,
        text: admireRealAndXoral(live.title, c.id, user.name, Date.now() + i),
      },
    });
  }
  return live;
}

export function endLive(db: XoralDb, user: XoralUser) {
  const live = db.lives.find((l) => l.hostId === user.id && !l.endedAt);
  if (live) live.endedAt = Date.now();
  return live;
}

export function viewPost(db: XoralDb, post: SocialPost, meId?: string): FeedPostView {
  const author = db.users.find((u) => u.id === post.authorId)!;
  const comments = db.comments.filter((c) => c.postId === post.id && c.body);
  const liked = (type: 'post' | 'comment' | 'reply', id: string) =>
    meId ? db.likes.some((l) => l.userId === meId && l.targetType === type && l.targetId === id) : false;
  return {
    id: post.id,
    author: toPublic(db, author),
    body: post.body,
    image: post.image,
    video: post.kind === 'reel' ? post.video || sceneVideo(seedFromId(post.id)) : undefined,
    audio: post.kind === 'reel' ? sceneAudio(seedFromId(post.id)) : undefined,
    hashtags: post.hashtags,
    kind: post.kind,
    likes: db.likes.filter((l) => l.targetType === 'post' && l.targetId === post.id).length + 12 + (post.body.length % 80),
    likedByMe: liked('post', post.id),
    reposts: (db.reposts || []).filter((r) => r.postId === post.id).length + 3 + (post.body.length % 24),
    repostedByMe: meId ? (db.reposts || []).some((r) => r.userId === meId && r.postId === post.id) : false,
    commentsCount: comments.length,
    createdAt: post.createdAt,
    comments: comments
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((comment) => {
        const cAuthor = db.users.find((u) => u.id === comment.authorId)!;
        const replies = db.replies.filter((r) => r.commentId === comment.id);
        return {
          id: comment.id,
          author: toPublic(db, cAuthor),
          body: comment.body,
          likes: db.likes.filter((l) => l.targetType === 'comment' && l.targetId === comment.id).length,
          likedByMe: liked('comment', comment.id),
          createdAt: comment.createdAt,
          typingName: comment.typingName,
          replies: replies.map((reply) => {
            const rAuthor = db.users.find((u) => u.id === reply.authorId)!;
            return {
              id: reply.id,
              author: toPublic(db, rAuthor),
              body: reply.body,
              likes: db.likes.filter((l) => l.targetType === 'reply' && l.targetId === reply.id).length,
              likedByMe: liked('reply', reply.id),
              createdAt: reply.createdAt,
            };
          }),
        };
      }),
  };
}

export function getProfile(db: XoralDb, idOrHandle: string, meId?: string) {
  const user = db.users.find((u) => u.id === idOrHandle || u.handle === idOrHandle);
  if (!user) return null;
  const mine = db.posts.filter((p) => p.authorId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const posts = mine.filter((p) => p.kind === 'post').map((p) => viewPost(db, p, meId));
  const reels = mine.filter((p) => p.kind === 'reel').map((p) => viewPost(db, p, meId));
  const repostIds = new Set((db.reposts || []).filter((r) => r.userId === user.id).map((r) => r.postId));
  const reposts = db.posts.filter((p) => repostIds.has(p.id)).map((p) => viewPost(db, p, meId));
  const now = Date.now();
  const stories = db.stories
    .filter((s) => s.authorId === user.id && s.expiresAt > now)
    .map((s) => ({
      ...s,
      author: toPublic(db, user),
    }));
  const followedByMe = meId ? db.follows.some((f) => f.followerId === meId && f.followingId === user.id) : false;
  const followerIds = db.follows.filter((f) => f.followingId === user.id).map((f) => f.followerId);
  const myFollowing = new Set(
    meId ? db.follows.filter((f) => f.followerId === meId).map((f) => f.followingId) : [],
  );
  const preferred = followerIds.filter((id) => myFollowing.has(id) && id !== meId);
  const picks = (preferred.length ? preferred : followerIds.filter((id) => id !== meId)).slice(0, 2);
  const followedBy = picks
    .map((id) => db.users.find((u) => u.id === id))
    .filter((u): u is XoralUser => Boolean(u))
    .map((u) => toPublic(db, u));
  const profile = toPublic(db, user);
  const titles = [user.city.split(' ')[0], profile.role || 'Life', 'XO8', user.name.split(' ')[0]].filter(Boolean);
  const highlights = (stories.length ? stories : mine.slice(0, 4)).slice(0, 4).map((item, i) => ({
    id: `${user.id}-hl-${i}`,
    title: String(titles[i % titles.length]).slice(0, 10),
    image: 'image' in item && item.image ? item.image : scenePhoto(seedFromId(user.id) + i, 'portrait'),
  }));
  return {
    user: profile,
    posts,
    reels,
    reposts,
    stories,
    followedByMe,
    followedBy,
    highlights,
  };
}

export { LIVE_NEED };
