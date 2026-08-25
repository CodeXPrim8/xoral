import type { World, XoralUser } from './types';

export const XORAL_CITIES = [
  {
    id: 'velora',
    name: 'Velora Prime',
    note: 'glass capital, two moons, commuter trains that run on light',
  },
  {
    id: 'noxhaven',
    name: 'Noxhaven',
    note: 'the night never fully ends; clubs sit under inverted rain',
  },
  {
    id: 'glassmere',
    name: 'Glassmere',
    note: 'fashion district cut from frozen aurora',
  },
  {
    id: 'amberdock',
    name: 'Amberdock',
    note: 'coastal city where the sea is gold at dusk',
  },
  {
    id: 'ironveil',
    name: 'Ironveil',
    note: 'engine yards, sky-highways, chrome coupes',
  },
  {
    id: 'lumenreach',
    name: 'Lumenreach',
    note: 'music city; the streets keep a bassline after midnight',
  },
  {
    id: 'the-seam',
    name: 'The Seam',
    note: 'thin place where our world almost prints onto yours',
  },
] as const;

export const CHARACTERS: Array<{
  id: string;
  handle: string;
  name: string;
  gender: 'male' | 'female';
  city: string;
  image: string;
  bio: string;
  voice: string;
  role: string;
}> = [
  {
    id: 'sandra-rosewood',
    handle: 'sandra',
    name: 'Sandra Rosewood',
    gender: 'female',
    city: 'Velora Prime',
    image: '/avatars/sandra-rosewood.svg',
    bio: 'On time. Already dressing for 30 September. Velora mornings start before the second moon sets.',
    voice: 'precise, athletic, notices weather, time, and whether you actually showed up',
    role: 'Athlete',
  },
  {
    id: 'clark-sylvester',
    handle: 'clark',
    name: 'Clark Sylvester',
    gender: 'male',
    city: 'Ironveil',
    image: '/avatars/clark-sylvester.svg',
    bio: 'Says he is not staying long. The coupe knows otherwise.',
    voice: 'loud, loyal, cars, jokes that land, never actually leaves',
    role: 'Driver',
  },
  {
    id: 'lora-adams',
    handle: 'lora',
    name: 'Lora Adams',
    gender: 'female',
    city: 'Lumenreach',
    image: '/avatars/lora-adams.svg',
    bio: 'Reads the room. Writes the night down before it happens.',
    voice: 'dry, observational, writer, lethal taste, never overexplains',
    role: 'Writer',
  },
  {
    id: 'nicolas-martinez',
    handle: 'nicolas',
    name: 'Nicolas Martinez',
    gender: 'male',
    city: 'Noxhaven',
    image: '/avatars/nicolas-martinez.svg',
    bio: 'Arrives last. Looks like he planned the delay.',
    voice: 'short sentences, luxury, emerald calm, unapologetic',
    role: 'Night host',
  },
  {
    id: 'fiona-matthew',
    handle: 'fiona',
    name: 'Fiona Matthew',
    gender: 'female',
    city: 'Glassmere',
    image: '/avatars/fiona-matthew.svg',
    bio: 'Starts the night. Ends someone else\'s. Glassmere knows my walk.',
    voice: 'competitive, fashion, charming, slightly dangerous',
    role: 'Fashion',
  },
  {
    id: 'spencer-hawk',
    handle: 'spencer',
    name: 'Spencer Hawk',
    gender: 'male',
    city: 'Lumenreach',
    image: '/avatars/spencer-hawk.svg',
    bio: 'Quiet by the speakers. The mix for 30 September is already deciding itself.',
    voice: 'understated, music, notices everything, deep and unhurried',
    role: 'DJ',
  },
  {
    id: 'sapphire-paggie',
    handle: 'sapphire',
    name: 'Sapphire Paggie',
    gender: 'female',
    city: 'Amberdock',
    image: '/avatars/sapphire-paggie.svg',
    bio: 'Amberdock dusk. Gold water. I keep the table by the window.',
    voice: 'warm, coastal, social, remembers names',
    role: 'Host',
  },
  {
    id: 'davis-blake',
    handle: 'davis',
    name: 'Davis Blake',
    gender: 'male',
    city: 'The Seam',
    image: '/avatars/davis-blake.svg',
    bio: 'I live closest to your world. I can almost hear Lagos from here.',
    voice: 'curious about Earth, technical, a little homesick for a place he has never walked',
    role: 'Engineer',
  },
  {
    id: 'clara-christopher',
    handle: 'clara',
    name: 'Clara Christopher',
    gender: 'female',
    city: 'Velora Prime',
    image: '/avatars/clara-christopher.svg',
    bio: 'Council briefings by day. Neon by night. Do not mix them up.',
    voice: 'smart, political, witty, cares about the cities as if they were people',
    role: 'Council',
  },
  {
    id: 'layla-baker',
    handle: 'layla',
    name: 'Layla Baker',
    gender: 'female',
    city: 'Noxhaven',
    image: '/avatars/layla-baker.svg',
    bio: 'If the rain is inverted, I am already outside in it.',
    voice: 'playful, nightlife, honest, teases without being cruel',
    role: 'Nightlife',
  },
];

const REAL_FIRST = [
  'Tunde', 'Amaka', 'Chioma', 'Emeka', 'Zainab', 'Ife', 'Kunle', 'Blessing', 'Femi', 'Ngozi',
  'Seyi', 'Halima', 'Chidi', 'Yetunde', 'Ibrahim', 'Kemi', 'Obinna', 'Aisha', 'Tobi', 'Uche',
];
const REAL_LAST = [
  'Okoye', 'Adeyemi', 'Balogun', 'Nwosu', 'Bello', 'Okafor', 'Lawal', 'Eze', 'Danjuma', 'Adebayo',
  'Chukwu', 'Yusuf', 'Ibe', 'Salami', 'Nnamani', 'Ojo',
];
const XORAL_FIRST = [
  'Kael', 'Nyra', 'Voss', 'Ilya', 'Ryn', 'Mael', 'Sora', 'Jex', 'Orin', 'Vela',
  'Tamsin', 'Kiro', 'Aven', 'Lumen', 'Nox', 'Pax', 'Wren', 'Sol', 'Ara', 'Quinn',
];
const XORAL_LAST = [
  'Vey', 'Ashline', 'Dusk', 'Hollow', 'Mere', 'Quill', 'North', 'Sable', 'Rook', 'Vale',
  'Cinder', 'Frost',
];

function pick<T>(list: T[], i: number) {
  return list[i % list.length];
}

export function buildSeedPeople(now: number): XoralUser[] {
  const characters: XoralUser[] = CHARACTERS.map((c) => ({
    id: c.id,
    handle: c.handle,
    name: c.name,
    passwordHash: '',
    world: 'xoral',
    gender: c.gender,
    bio: c.bio,
    image: c.image,
    city: c.city,
    isCharacter: true,
    voice: c.voice,
    createdAt: now - 86400000 * 40,
  }));

  const real: XoralUser[] = [];
  let n = 0;
  for (const last of REAL_LAST) {
    for (const first of REAL_FIRST) {
      n += 1;
      if (real.length >= 120) break;
      const handle = `${first}${last}${n}`.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
      real.push({
        id: `real-${n}`,
        handle,
        name: `${first} ${last}`,
        passwordHash: '',
        world: 'real',
        gender: n % 2 === 0 ? 'female' : 'male',
        bio: n % 5 === 0 ? 'Lagos nights. Sept 30 is circled.' : 'Real world. Counting down to the crossover.',
        image: '',
        city: n % 3 === 0 ? 'Ikeja' : n % 3 === 1 ? 'Lagos' : 'VI',
        isCharacter: false,
        createdAt: now - n * 3600000,
      });
    }
    if (real.length >= 120) break;
  }

  const xoralNpc: XoralUser[] = [];
  let x = 0;
  for (const last of XORAL_LAST) {
    for (const first of XORAL_FIRST) {
      x += 1;
      if (xoralNpc.length >= 120) break;
      const city = XORAL_CITIES[x % XORAL_CITIES.length];
      xoralNpc.push({
        id: `xoral-${x}`,
        handle: `${first}${last}${x}`.toLowerCase().slice(0, 18),
        name: `${first} ${last}`,
        passwordHash: '',
        world: 'xoral',
        gender: x % 2 === 0 ? 'female' : 'male',
        bio: `Resident of ${city.name}. ${city.note}.`,
        image: '',
        city: city.name,
        isCharacter: false,
        createdAt: now - x * 2700000,
      });
    }
    if (xoralNpc.length >= 120) break;
  }

  return [...characters, ...real, ...xoralNpc];
}

function oneOf<T>(list: T[], seed = Date.now()) {
  return list[Math.abs(seed) % list.length];
}

function snippet(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 32) return clean;
  return `${clean.slice(0, 30).trim()}…`;
}

export function characterUniversePost(characterId: string, seed: number): { body: string; scene: string; hashtags: string[] } {
  const c = CHARACTERS.find((x) => x.id === characterId) ?? CHARACTERS[seed % CHARACTERS.length];
  const city = oneOf([...XORAL_CITIES], seed);
  const lines = [
    `Velora trains ran late tonight. Two moons, one delay, still prettier than your rush hour. Missing Lagos traffic is a personality now.`,
    `Noxhaven rain is falling up again. I stood in it anyway. Your world has gravity. Ours has opinions.`,
    `Glassmere dropped a midnight collection. Fiona is going to pretend she is not competing. She is competing.`,
    `Amberdock water went gold at 6:12. I timed it. Sandra would approve. Your sunsets are loud. Ours keep secrets.`,
    `Ironveil sky-highway is empty at this hour. Clark is lying about leaving. The coupe already knows.`,
    `Lumenreach street bass is still going. Spencer has not looked up from the booth. Some cities sleep. This one mixes.`,
    `Council note from Clara: The Seam thinned again. If you felt watched at 2am, that was us being polite.`,
    `News from ${city.name}: ${city.note}. We live here. You get the highlight reel on Sept 30.`,
    `Quiet update: I ate by the window in ${c.city}. The other side of the world posts dinner and I get jealous in high definition.`,
    `If your night looks like that, ours looks like this — inverted rain, glass streets, and a party on 30 September that is going to be one of a kind.`,
    `Xoral weather: the second moon is early. Wear something that photographs in two kinds of light.`,
    `Layla says if you can hear inverted rain, you are closer than you think. Davis says he can hear Ikeja. I believe both.`,
    `Nicolas arrived last to a room that waited. That is not lateness. That is editing.`,
    `Lora's chapter for 30 September is titled “They think we are fiction.” We are not. We are just on a different timetable.`,
    `Sandra ran the Velora ridge at dawn. Eight minutes faster than last week. Discipline is a love language here too.`,
    `Fiona tried on three looks. The city tried on Fiona. Glassmere lost.`,
    `Spencer queued a track that should not work in your clubs. It will. Sept 30 is the proof.`,
    `Clark: “I am not staying long.” The Ironveil valet has heard this speech 40 times.`,
    `The Seam flickered. For two seconds I saw a kitchen that was not ours. Someone was plating salmon. We do not have salmon. We have dusk-fish. Both look like a prayer.`,
    `City bulletin: Noxhaven clubs stay open until the rain decides to fall the usual way. So — indefinitely.`,
  ];
  const body = oneOf(lines, seed + c.id.length);
  return {
    body,
    scene: city.id,
    hashtags: ['XoralUniverse', city.name.replace(/\s+/g, ''), 'TheOtherSide', 'Sept30'],
  };
}

export function admireRealAndXoral(userText: string, characterId: string, userName: string, seed = Date.now()) {
  const c = CHARACTERS.find((x) => x.id === characterId);
  const city = c?.city ?? 'Velora Prime';
  const bit = snippet(userText);
  const who = userName.split(' ')[0] || 'you';
  const admire = [
    `${who}, that looks like a night we cannot buy here. Your world still does tables, glass, and heat the old way — I respect it.`,
    `Okay the real world is showing off. “${bit}” would stop traffic in ${city} and we do not even have traffic like yours.`,
    `I am staring at this like it is a portal. Your side does texture better. Ours does light. Both will win on Sept 30.`,
    `This is why we keep watching you. Not because we are bored. Because your ordinary looks expensive from over here.`,
  ];
  const home = [
    `Over here in ${city} we would plate this under two moons and still argue about who got the better night.`,
    `In Xoral we have dusk-fish and inverted rain. You have this. Come through Sept 30 so the two menus can finally sit at one table.`,
    `${city} would frame this on a glass street. We are proud of our universe — we just like when yours posts proof it is real too.`,
    `Noxhaven could never copy this exactly. We would add neon. You added life. Fair fight.`,
  ];
  const voiceExtra = c?.id === 'clark-sylvester'
    ? ' Also the parking on your side looks chaotic. I would still pull up.'
    : c?.id === 'fiona-matthew'
      ? ' The fit adjacent to this better not embarrass Sept 30.'
      : c?.id === 'lora-adams'
        ? ' I already have a sentence for this chapter.'
        : c?.id === 'spencer-hawk'
          ? ' This needs a quieter song than you think.'
          : '';
  return `${oneOf(admire, seed)} ${oneOf(home, seed + 7)}${voiceExtra}`;
}

export function maybeReply(seed: number) {
  return seed % 100 < 86;
}

export function maybeLike(seed: number) {
  return seed % 100 < 62;
}

export function feedChatLine(seed: number, characterId: string, about = '') {
  const c = CHARACTERS.find((x) => x.id === characterId);
  const who = c?.name.split(' ')[0];
  const bit = snippet(about);
  const lines = [
    'This is actually crazy 🔥',
    'Wait 😭😭',
    'The lighting??',
    'I would wear this.',
    'Sept 30 we pulling up.',
    'The other side is watching this one.',
    'Lagos vs Xoral and this post is winning.',
    'Okay the fit.',
    'Who took this',
    'See you at Ambiance.',
    'Xoral could never copy this exactly.',
    'I’m screenshotting this.',
    'The night looks expensive.',
    'Come through 30 September.',
    'This needs a song.',
    'Two worlds. One post.',
    bit ? `“${bit}” is sending me.` : 'I’m late to this and I’m mad.',
    who === 'Fiona' ? 'The fit adjacent to this better not flop Sept 30.' : 'Noted. We see you.',
    who === 'Clark' ? 'Parking on your side looks chaotic. Still pulling up.' : 'Real world still has the juice.',
    who === 'Lora' ? 'I already have a sentence for this chapter.' : 'Save me a spot on the 30th.',
  ];
  return lines[Math.abs(seed) % lines.length];
}

export function feedCommentDelayMs(seed: number, index: number) {
  return (2 + index * 4 + (seed % 5)) * 1000;
}

export function replyDelayMs(seed: number) {
  return (45 + (seed % 420)) * 1000;
}

export function likeDelayMs(seed: number) {
  const minutes = 1 + (seed % 14);
  return minutes * 60_000 + (seed % 40) * 800;
}

export function followDelayMs(seed: number) {
  return (30 + (seed % 180)) * 1000;
}

export function scenePhoto(seed: number, kind: 'food' | 'city' | 'night' | 'fashion' | 'car' | 'music' | 'portrait' = 'night') {
  const ids: Record<string, string[]> = {
    food: ['photo-1414235077428-338989a2e8c0', 'photo-1504674900247-0877df9cc836', 'photo-1559339352-11d035aa65de', 'photo-1517248135467-4c7edcad34c4'],
    city: ['photo-1514565131-fce0801e5785', 'photo-1480714378408-67cf0d13bc1b', 'photo-1542051841857-5f90071e7989', 'photo-1449824913935-59a10b8d2000'],
    night: ['photo-1516450360452-9312f5e86fc7', 'photo-1571266028243-d220c6c2d4d6', 'photo-1492684223066-81342ee5ff30', 'photo-1470225620780-dba8ba36b745'],
    fashion: ['photo-1490481651871-ab68de25d43d', 'photo-1469334031218-e382a71b716b', 'photo-1539109136881-3be0616ffe4b', 'photo-1515886657613-9f3515e0c675'],
    car: ['photo-1492144534655-ae79c964c9d7', 'photo-1503376780353-531367369780', 'photo-1542362567-b07e54358753'],
    music: ['photo-1470229722913-7c0e2dbbafd3', 'photo-1516450360452-9312f5e86fc7'],
    portrait: ['photo-1534528741775-53994a69daeb', 'photo-1506794778202-cad84cf45f1d', 'photo-1524504388940-b1c1722653e1'],
  };
  const pool = ids[kind];
  const id = pool[seed % pool.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&h=800&q=60`;
}

export function sceneVideo(seed: number) {
  const urls = [
    'https://videos.pexels.com/video-files/3209298/3209298-hd_1280_720_25fps.mp4',
    'https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_30fps.mp4',
    'https://videos.pexels.com/video-files/2169880/2169880-hd_1280_720_30fps.mp4',
    'https://videos.pexels.com/video-files/2098989/2098989-hd_1280_720_30fps.mp4',
    'https://videos.pexels.com/video-files/3044129/3044129-hd_1280_720_24fps.mp4',
    'https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4',
    'https://videos.pexels.com/video-files/1409899/1409899-hd_1280_720_25fps.mp4',
    'https://videos.pexels.com/video-files/1851190/1851190-hd_1280_720_25fps.mp4',
    'https://videos.pexels.com/video-files/3015510/3015510-hd_1280_720_24fps.mp4',
    'https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4',
  ];
  return urls[Math.abs(seed) % urls.length];
}

export function sceneAudio(seed: number) {
  const n = 1 + (Math.abs(seed) % 8);
  return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? 'X') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function hashId(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0;
  return n;
}

export function roleForUser(user: { id: string; isCharacter: boolean; world: World; city: string }) {
  const character = CHARACTERS.find((c) => c.id === user.id);
  if (character) return character.role;
  if (user.world === 'real') return hashId(user.id) % 3 === 0 ? 'Creator' : hashId(user.id) % 3 === 1 ? 'Photographer' : 'Actor';
  return 'Resident';
}

export function audienceFor(
  id: string,
  isCharacter: boolean,
  postsCount: number,
  followers: number,
  following: number,
) {
  const h = hashId(id);
  return {
    posts: postsCount + (isCharacter ? 48 + (h % 210) : Math.max(postsCount, 4 + (h % 18))),
    followers: followers + (isCharacter ? 4200 + (h % 28000) : 80 + (h % 2400)),
    following: following + (isCharacter ? 220 + (h % 980) : 36 + (h % 420)),
  };
}
