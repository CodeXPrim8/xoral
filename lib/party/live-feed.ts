export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  image: string;
  gender: 'male' | 'female';
};

export type FeedReply = {
  id: string;
  author: FeedAuthor;
  body: string;
  likes: number;
  likedByMe: boolean;
  createdAt: number;
  isGuest?: boolean;
};

export type FeedComment = {
  id: string;
  author: FeedAuthor;
  body: string;
  likes: number;
  likedByMe: boolean;
  createdAt: number;
  replies: FeedReply[];
  isGuest?: boolean;
  typingName?: string;
};

export type FeedPost = {
  id: string;
  author: FeedAuthor;
  body: string;
  image?: string;
  hashtags: string[];
  likes: number;
  reposts: number;
  likedByMe: boolean;
  repostedByMe: boolean;
  createdAt: number;
  comments: FeedComment[];
};

export const FEED_AUTHORS: FeedAuthor[] = [
  { id: 'sandra-rosewood', name: 'Sandra', handle: '@sandra', image: '/avatars/sandra-rosewood.svg', gender: 'female' },
  { id: 'clark-sylvester', name: 'Clark', handle: '@clark', image: '/avatars/clark-sylvester.svg', gender: 'male' },
  { id: 'lora-adams', name: 'Lora', handle: '@lora', image: '/avatars/lora-adams.svg', gender: 'female' },
  { id: 'nicolas-martinez', name: 'Nicolas', handle: '@nicolas', image: '/avatars/nicolas-martinez.svg', gender: 'male' },
  { id: 'fiona-matthew', name: 'Fiona', handle: '@fiona', image: '/avatars/fiona-matthew.svg', gender: 'female' },
  { id: 'spencer-hawk', name: 'Spencer', handle: '@spencer', image: '/avatars/spencer-hawk.svg', gender: 'male' },
  { id: 'sapphire-paggie', name: 'Sapphire', handle: '@sapphire', image: '/avatars/sapphire-paggie.svg', gender: 'female' },
  { id: 'davis-blake', name: 'Davis', handle: '@davis', image: '/avatars/davis-blake.svg', gender: 'male' },
  { id: 'clara-christopher', name: 'Clara', handle: '@clara', image: '/avatars/clara-christopher.svg', gender: 'female' },
  { id: 'layla-baker', name: 'Layla', handle: '@layla', image: '/avatars/layla-baker.svg', gender: 'female' },
];

export const GUEST_AUTHOR: FeedAuthor = {
  id: 'you',
  name: 'You',
  handle: '@guest',
  image: '/avatars/sandra-rosewood.svg',
  gender: 'female',
};

type SceneKey = 'fashion' | 'redcarpet' | 'club' | 'city' | 'dj' | 'vip' | 'door' | 'neon' | 'party' | 'moody' | 'cars' | 'dinner' | 'gym';

type ScriptReply = { authorId: string; body: string };
type ScriptComment = { authorId: string; body: string; replies?: ScriptReply[] };
type ScriptPost = {
  authorId: string;
  body: string;
  scene: SceneKey;
  hashtags: string[];
  thread: ScriptComment[];
};

/** One unique photo per post — never reused across the feed. */
const UNIQUE_PHOTOS = [
  'photo-1492144534655-ae79c964c9d7',
  'photo-1490481651871-ab68de25d43d',
  'photo-1551538827-9c037cb4f32a',
  'photo-1414235077428-338989a2e8c0',
  'photo-1470225620780-dba8ba36b745',
  'photo-1469334031218-e382a71b716b',
  'photo-1534438327276-14e5300c3a48',
  'photo-1595777457583-95e059d581b8',
  'photo-1514565131-fce0801e5785',
  'photo-1517248135467-4c7edcad34c4',
  'photo-1516450360452-9312f5e86fc7',
  'photo-1483985988355-763728e1935b',
  'photo-1503376780353-531367369780',
  'photo-1517836357463-d25dfeac3438',
  'photo-1492684223066-81342ee5ff30',
  'photo-1480714378408-67cf0d13bc1b',
  'photo-1470337458703-46ad1756a187',
  'photo-1539109136881-3be0616ffe4b',
  'photo-1470229722913-7c0e2dbbafd3',
  'photo-1529139574466-a303027c1d8b',
  'photo-1542362567-b07e54358753',
  'photo-1515886657613-9f3515e0c675',
  'photo-1552519507-da3b142c6e3d',
  'photo-1559339352-11d035aa65de',
  'photo-1571266028243-d220c6c2d4d6',
  'photo-1571902943202-507ec2618e8f',
  'photo-1510812431401-41d2bd2722f3',
  'photo-1504674900247-0877df9cc836',
  'photo-1542051841857-5f90071e7989',
  'photo-1449824913935-59a10b8d2000',
];

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&h=800&q=60`;
}

const SCENE_PHOTOS: Record<SceneKey, string[]> = {
  fashion: [
    'photo-1490481651871-ab68de25d43d',
    'photo-1469334031218-e382a71b716b',
    'photo-1483985988355-763728e1935b',
    'photo-1595777457583-95e059d581b8',
    'photo-1539109136881-3be0616ffe4b',
  ],
  redcarpet: [
    'photo-1519671482749-fd09be7ccebf',
    'photo-1464366400600-7168b8af9bc3',
    'photo-1514525253161-7a46d19cd819',
    'photo-1492684223066-81342ee5ff30',
  ],
  club: [
    'photo-1571266028243-d220c6c2d4d6',
    'photo-1566737236501-c2c0e0b2b1ae',
    'photo-1574391884720-bbc3740c59d1',
    'photo-1540039155733-5bb30b53aa14',
  ],
  city: [
    'photo-1514565131-fce0801e5785',
    'photo-1480714378408-67cf0d13bc1b',
    'photo-1542051841857-5f90071e7989',
    'photo-1449824913935-59a10b8d2000',
  ],
  dj: [
    'photo-1470225620780-dba8ba36b745',
    'photo-1516450360452-9312f5e86fc7',
    'photo-1470229722913-7c0e2dbbafd3',
    'photo-1571266028243-d220c6c2d4d6',
  ],
  vip: [
    'photo-1551538827-9c037cb4f32a',
    'photo-1470337458703-46ad1756a187',
    'photo-1510812431401-41d2bd2722f3',
    'photo-1514933651103-005eec06c04b',
  ],
  door: [
    'photo-1501281668745-f7f861bb90b8',
    'photo-1540039155733-5bb30b53aa14',
    'photo-1429962714451-bb934ecdc4ec',
  ],
  neon: [
    'photo-1550684848-fac1c5b4e853',
    'photo-1533158326339-7f3cf2404354',
    'photo-1563089145-599997674d42',
    'photo-1514525253161-7a46d19cd819',
  ],
  party: [
    'photo-1492684223066-81342ee5ff30',
    'photo-1429962714451-bb934ecdc4ec',
    'photo-1470229722913-7c0e2dbbafd3',
    'photo-1516450360452-9312f5e86fc7',
  ],
  moody: [
    'photo-1470337458703-46ad1756a187',
    'photo-1514933651103-005eec06c04b',
    'photo-1574391884720-bbc3740c59d1',
    'photo-1551538827-9c037cb4f32a',
  ],
  cars: [
    'photo-1492144534655-ae79c964c9d7',
    'photo-1503376780353-531367369780',
    'photo-1542362567-b07e54358753',
    'photo-1552519507-da3b142c6e3d',
    'photo-1583121274602-3e2820c69888',
  ],
  dinner: [
    'photo-1414235077428-338989a2e8c0',
    'photo-1517248135467-4c7edcad34c4',
    'photo-1559339352-11d035aa65de',
    'photo-1414235077428-338989a2e8c0',
  ],
  gym: [
    'photo-1534438327276-14e5300c3a48',
    'photo-1517836357463-d25dfeac3438',
    'photo-1571902943202-507ec2618e8f',
  ],
};

const SCRIPT_POSTS: ScriptPost[] = [
  {
    authorId: 'clark-sylvester',
    body: "Just left the wash. If this whip is not outside Ambiance on Sept 30, I didn't buy it. Nicolas keep that little coupe at home 😭",
    scene: 'cars',
    hashtags: ['XoralParty', 'Sept30', 'Whip', 'LagosNights'],
    thread: [
      { authorId: 'nicolas-martinez', body: 'The wash does not fix the driver. I will pull up when I feel like it.', replies: [{ authorId: 'clark-sylvester', body: 'At least I arrive. You will be fashionably lost as usual.' }] },
      { authorId: 'spencer-hawk', body: "Just don't blast your playlist from the sunroof. I beg." },
      { authorId: 'davis-blake', body: 'He washed a car and became a philosopher. Sept 30 go humble you.' },
    ],
  },
  {
    authorId: 'sandra-rosewood',
    body: "Third fitting today. Still not telling Fiona the colour. Sept 30 is a runway and I already paid for the front row.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'TheOtherSide'],
    thread: [
      { authorId: 'fiona-matthew', body: 'Hide the colour all you want. Gold still eats. See you on the 30th 💅', replies: [{ authorId: 'sandra-rosewood', body: 'Cute. Wear gold. I dare you.' }] },
      { authorId: 'layla-baker', body: 'She said “third fitting” like the rest of us are not also unwell.' },
      { authorId: 'lora-adams', body: 'Meanwhile Clark is washing a car like that is an outfit.' },
    ],
  },
  {
    authorId: 'nicolas-martinez',
    body: "Clark washed a car and thought he became a brand. Anyway. Corner table on the 30th. Not the middle. Never the middle.",
    scene: 'vip',
    hashtags: ['XoralParty', 'Sept30', 'VIP', 'Ambiance'],
    thread: [
      { authorId: 'clark-sylvester', body: "Corner table because you can't dance. We know.", replies: [{ authorId: 'nicolas-martinez', body: 'I can dance. I choose not to suffer.' }] },
      { authorId: 'fiona-matthew', body: 'Save me a seat if you are going to be mysterious all night.' },
    ],
  },
  {
    authorId: 'fiona-matthew',
    body: "Dinner last night. He asked what I'm doing Sept 30. I said Xoral. He said can I come. I said buy a ticket first babe.",
    scene: 'dinner',
    hashtags: ['XoralParty', 'Sept30', 'DinnerDate', 'GetTickets'],
    thread: [
      { authorId: 'sapphire-paggie', body: 'The way she said “babe” and still sent the payment link 😭', replies: [{ authorId: 'fiona-matthew', body: 'Romance is a ticket. I said what I said.' }] },
      { authorId: 'clara-christopher', body: 'This is the blog. I am screenshotting.' },
      { authorId: 'clark-sylvester', body: 'Imagine being told to buy a ticket on a date. Respect.' },
    ],
  },
  {
    authorId: 'spencer-hawk',
    body: "Making the Sept 30 playlist. Clark requested his own song. I put it at number 47. Under a 6 hour mix. He will find it at 3am.",
    scene: 'dj',
    hashtags: ['XoralParty', 'Sept30', 'OnTheAux', 'TheOtherSide'],
    thread: [
      { authorId: 'clark-sylvester', body: 'Number 47 is criminal. I know people.', replies: [{ authorId: 'spencer-hawk', body: 'You know me. That is the problem.' }] },
      { authorId: 'davis-blake', body: 'Leave the aux to the quiet ones. They are dangerous.' },
      { authorId: 'lora-adams', body: 'This is why Spencer is my favourite boy. Do not tell him.' },
    ],
  },
  {
    authorId: 'lora-adams',
    body: "Blog update: men who say they're not staying long. Featuring Clark. The boots arrived though. Ikeja isn't ready for Sept 30.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'Ikeja', 'NightLook'],
    thread: [
      { authorId: 'clark-sylvester', body: "I AM not staying long. Why is this a series.", replies: [{ authorId: 'lora-adams', body: "We both know that's a lie. Chapter 2 drops tomorrow." }] },
      { authorId: 'sandra-rosewood', body: 'The boots ate. The blog ate. Clark did not eat.' },
      { authorId: 'nicolas-martinez', body: 'Write one about men who sit in corners. I will subscribe.' },
    ],
  },
  {
    authorId: 'davis-blake',
    body: "Legs day. Then I sat in the car for 20 minutes doing nothing. This is training for Sept 30. Don't ask.",
    scene: 'gym',
    hashtags: ['XoralParty', 'Sept30', 'XoralUniverse', 'Whip'],
    thread: [
      { authorId: 'clark-sylvester', body: 'Sitting in the car is not training. It is hiding.', replies: [{ authorId: 'davis-blake', body: 'Hiding from your playlist requests actually.' }] },
      { authorId: 'spencer-hawk', body: 'The 20 minutes of silence is the only part I respect.' },
    ],
  },
  {
    authorId: 'sapphire-paggie',
    body: "Layla posted heels. Sandra posted taller heels. I posted the dress. Fiona posted a threat. This is the Xoral Olympics and Sept 30 is the final.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'GirlsTrip'],
    thread: [
      { authorId: 'layla-baker', body: 'The heels were not a challenge. They were a warning 😌', replies: [{ authorId: 'sandra-rosewood', body: 'I took it personally. As I should.' }] },
      { authorId: 'fiona-matthew', body: 'It was not a threat. It was a forecast.' },
      { authorId: 'clara-christopher', body: "I'm bringing a notebook. This is content." },
    ],
  },
  {
    authorId: 'clara-christopher',
    body: "Coffee. Pilates. Voice note to the group chat nobody asked for. Counting down to Sept 30 like it is a personality. Because it is.",
    scene: 'city',
    hashtags: ['XoralParty', 'Sept30', 'XoralUniverse', 'LagosNights'],
    thread: [
      { authorId: 'layla-baker', body: 'The voice note was 4 minutes. I listened. I judged. I loved.' },
      { authorId: 'sapphire-paggie', body: 'She is documenting our lives and we said thank you.' },
      { authorId: 'fiona-matthew', body: 'Keep the camera rolling. I look expensive in the morning too.' },
    ],
  },
  {
    authorId: 'layla-baker',
    body: "Dinner was cute until he said he might be “busy” on Sept 30. I said me too. At Ambiance. With better lighting.",
    scene: 'dinner',
    hashtags: ['XoralParty', 'Sept30', 'DinnerDate', 'Ambiance'],
    thread: [
      { authorId: 'fiona-matthew', body: 'Busy is not a schedule. Busy is a red flag. Next.', replies: [{ authorId: 'layla-baker', body: 'Already next. Already dressed. Already going.' }] },
      { authorId: 'sandra-rosewood', body: 'The 30th does not compete with situationships. Situationships compete with the 30th.' },
    ],
  },
  {
    authorId: 'clark-sylvester',
    body: "Spencer acting mysterious by the speakers like the aux is a government job. Bro just play the song. Sept 30 I'm dancing anyway.",
    scene: 'dj',
    hashtags: ['XoralParty', 'Sept30', 'OnTheAux', 'PartyNight'],
    thread: [
      { authorId: 'spencer-hawk', body: 'You dance like you wash cars. Loud. Unnecessary.', replies: [{ authorId: 'clark-sylvester', body: 'And yet the girls still look. Interesting.' }] },
      { authorId: 'nicolas-martinez', body: 'Let the man cook. You would request the same three songs.' },
      { authorId: 'lora-adams', body: 'Clark dancing is a public service announcement. I will be filming.' },
    ],
  },
  {
    authorId: 'fiona-matthew',
    body: "Sandra said she's “already dressed” for a party in September. Girl the 30th can still change its mind. Sit down. Look pretty. Compete fairly.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'TheOtherSide'],
    thread: [
      { authorId: 'sandra-rosewood', body: 'I am dressed. You are negotiating. There is a difference.', replies: [{ authorId: 'fiona-matthew', body: 'Keep talking. Gold does not get nervous.' }] },
      { authorId: 'sapphire-paggie', body: 'The girls are at war and I have popcorn and a two-plus ticket.' },
      { authorId: 'lora-adams', body: 'Both of you are going to walk in like you invented Lagos. I support this.' },
    ],
  },
  {
    authorId: 'nicolas-martinez',
    body: "Night drive. No destination. Just reminding the city that Sept 30 has a dress code and Clark is not on the committee.",
    scene: 'cars',
    hashtags: ['XoralParty', 'Sept30', 'Whip', 'LagosNights'],
    thread: [
      { authorId: 'clark-sylvester', body: "Dress code is 'look like you can afford the valet'. I can.", replies: [{ authorId: 'davis-blake', body: 'Afford and convince are different verbs.' }] },
      { authorId: 'spencer-hawk', body: 'Play something quiet in that car for once.' },
    ],
  },
  {
    authorId: 'sandra-rosewood',
    body: "Morning run. Then the gold earrings. Then I stared at the calendar like Sept 30 might come early if I ask nicely.",
    scene: 'gym',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'XoralUniverse'],
    thread: [
      { authorId: 'clara-christopher', body: 'She runs AND glows. I am blocking her for sport.' },
      { authorId: 'layla-baker', body: 'The calendar is not going to blink first. You will.' },
      { authorId: 'davis-blake', body: 'Some of us also ran. Nobody clapped. Noted.' },
    ],
  },
  {
    authorId: 'sapphire-paggie',
    body: "Girls 2+ is a love language. Who is linking for Vol. 08 because I will not be competing with Fiona's sequins by myself.",
    scene: 'party',
    hashtags: ['XoralParty', 'Sept30', 'GirlsTrip', 'GetTickets'],
    thread: [
      { authorId: 'clara-christopher', body: "I'm in. I have notes. I have outfits. I have gossip.", replies: [{ authorId: 'sapphire-paggie', body: 'Bring all three. Especially the gossip.' }] },
      { authorId: 'fiona-matthew', body: 'The sequins heard that. The sequins accepted the duel.' },
      { authorId: 'layla-baker', body: '2+ and a shared Uber. This is feminism.' },
    ],
  },
  {
    authorId: 'davis-blake',
    body: "Nicolas talks like he invented leather. Clark talks like he invented leaving early. I talk like Sept 30 is going to fix both of them.",
    scene: 'city',
    hashtags: ['XoralParty', 'Sept30', 'XoralUniverse', 'LagosNights'],
    thread: [
      { authorId: 'nicolas-martinez', body: 'Leather invented me actually.', replies: [{ authorId: 'clark-sylvester', body: 'This is why nobody sits with you in the middle.' }] },
      { authorId: 'spencer-hawk', body: 'Davis woke up and chose violence. Approved.' },
    ],
  },
  {
    authorId: 'lora-adams',
    body: "Update from this side: Fiona is collecting dinner dates like stamps. Sandra is collecting outfits. I am collecting evidence that Clark will stay till close.",
    scene: 'moody',
    hashtags: ['XoralParty', 'Sept30', 'TheOtherSide', 'Ikeja'],
    thread: [
      { authorId: 'fiona-matthew', body: 'Stamps? They are interviews. Only one gets the 30th.', replies: [{ authorId: 'lora-adams', body: 'Write that in the blog. I will fact check.' }] },
      { authorId: 'clark-sylvester', body: 'You people have a group chat about me. I can feel it.' },
      { authorId: 'sandra-rosewood', body: 'We have several.' },
    ],
  },
  {
    authorId: 'clara-christopher',
    body: "New post on the blog: what the boys think they're wearing vs what they will actually wear on Sept 30. Spencer is safe. The rest of you… pray.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'TheOtherSide'],
    thread: [
      { authorId: 'spencer-hawk', body: 'I did not ask to be safe. But I accept.', replies: [{ authorId: 'clark-sylvester', body: "Safe is the meanest compliment I've heard all week." }] },
      { authorId: 'nicolas-martinez', body: 'Put me in the leather column. I already know.' },
      { authorId: 'fiona-matthew', body: 'Publish it. Tag them. Let the 30th be messy.' },
    ],
  },
  {
    authorId: 'spencer-hawk',
    body: "Late night in the studio. The 30th mix has a moment where the lights should drop. If Clark talks through it I am unplugging him. Personally.",
    scene: 'dj',
    hashtags: ['XoralParty', 'Sept30', 'OnTheAux', 'PartyNight'],
    thread: [
      { authorId: 'clark-sylvester', body: 'I will whisper. Like a gentleman.', replies: [{ authorId: 'lora-adams', body: 'You have never whispered in your life.' }] },
      { authorId: 'davis-blake', body: 'Protect the drop. This is bigger than friendship.' },
    ],
  },
  {
    authorId: 'layla-baker',
    body: "Tried the party dress in the hotel mirror and walked to the balcony like Ambiance could see me from here. Sept 30 please hurry. I am already late to being iconic.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'Ambiance'],
    thread: [
      { authorId: 'sandra-rosewood', body: 'The balcony walk is crazy. I respect it.', replies: [{ authorId: 'layla-baker', body: 'Practice. The red carpet is 6. I will not fumble.' }] },
      { authorId: 'sapphire-paggie', body: 'Iconic is a group project. Do not go rogue.' },
      { authorId: 'nicolas-martinez', body: 'If the balcony can see you, Ikeja can hear you. Calm down.' },
    ],
  },
  {
    authorId: 'clark-sylvester',
    body: "Valet already has my name for the 30th. Nicolas is going to pretend he walked. I will have footage.",
    scene: 'cars',
    hashtags: ['XoralParty', 'Sept30', 'Whip', 'Ambiance'],
    thread: [
      { authorId: 'nicolas-martinez', body: 'Walking is a choice. Your engine is a cry for help.', replies: [{ authorId: 'clark-sylvester', body: 'Cry louder. The car still looks better.' }] },
      { authorId: 'davis-blake', body: 'Both of you need a hobby that is not each other.' },
    ],
  },
  {
    authorId: 'fiona-matthew',
    body: "Spa. Then the gold set. Then I sent Sandra a photo with no caption. She knows what it means.",
    scene: 'fashion',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'GirlsTrip'],
    thread: [
      { authorId: 'sandra-rosewood', body: 'I know what it means. I did not blink.', replies: [{ authorId: 'fiona-matthew', body: 'Blink on the 30th. That is the point.' }] },
      { authorId: 'layla-baker', body: 'The silent photo is psychological warfare. I am taking notes.' },
    ],
  },
  {
    authorId: 'davis-blake',
    body: "Test drove something I cannot name on the timeline. Sept 30 will name it for me.",
    scene: 'cars',
    hashtags: ['XoralParty', 'Sept30', 'Whip', 'LagosNights'],
    thread: [
      { authorId: 'clark-sylvester', body: 'If you cannot name it, it is not yours yet. Sit down.', replies: [{ authorId: 'davis-blake', body: 'Sept 30 will introduce us. Bring popcorn.' }] },
      { authorId: 'spencer-hawk', body: 'Name the playlist instead. That one you can afford.' },
    ],
  },
  {
    authorId: 'sapphire-paggie',
    body: "Breakfast meeting that was actually a dress committee. Clara took minutes. The 30th has a colour story now. Sorry boys.",
    scene: 'dinner',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'TheOtherSide'],
    thread: [
      { authorId: 'clara-christopher', body: 'I did take minutes. There is a spreadsheet. There are consequences.', replies: [{ authorId: 'lora-adams', body: 'Send the spreadsheet. I will add a Clark column.' }] },
      { authorId: 'clark-sylvester', body: 'Why am I in a colour story. I wear what I wear.' },
    ],
  },
  {
    authorId: 'spencer-hawk',
    body: "Someone asked me to “just play Afrobeats all night”. That is not a personality. The 30th mix has chapters. Read.",
    scene: 'dj',
    hashtags: ['XoralParty', 'Sept30', 'OnTheAux', 'PartyNight'],
    thread: [
      { authorId: 'lora-adams', body: 'Chapters. He said chapters. I am in love with the discipline.', replies: [{ authorId: 'clark-sylvester', body: 'Discipline is when my song is number 1. Simple.' }] },
      { authorId: 'nicolas-martinez', body: 'Let him cook. You would ruin the drop with a speech.' },
    ],
  },
  {
    authorId: 'sandra-rosewood',
    body: "Gym at 6. Tailor at 9. Calendar at noon. Sept 30 is not a date. It is a deadline.",
    scene: 'gym',
    hashtags: ['XoralParty', 'Sept30', 'NightLook', 'XoralUniverse'],
    thread: [
      { authorId: 'fiona-matthew', body: 'Deadline for you. Premiere for me.', replies: [{ authorId: 'sandra-rosewood', body: 'We will see whose camera roll wins.' }] },
      { authorId: 'davis-blake', body: 'I also gym at 6. Nobody put me in a blog. Injustice.' },
    ],
  },
  {
    authorId: 'nicolas-martinez',
    body: "Midnight espresso. Leather jacket on a chair like it has a reservation. The 30th already RSVP’d.",
    scene: 'moody',
    hashtags: ['XoralParty', 'Sept30', 'VIP', 'TheOtherSide'],
    thread: [
      { authorId: 'fiona-matthew', body: 'The jacket has a reservation. You still need a ticket.', replies: [{ authorId: 'nicolas-martinez', body: 'The corner table is the ticket.' }] },
      { authorId: 'clark-sylvester', body: 'Espresso at midnight is not rizz. It is insomnia.' },
    ],
  },
  {
    authorId: 'layla-baker',
    body: "He paid for dessert and thought that covered Sept 30. I smiled. I blocked. I steamed the dress.",
    scene: 'dinner',
    hashtags: ['XoralParty', 'Sept30', 'DinnerDate', 'NightLook'],
    thread: [
      { authorId: 'fiona-matthew', body: 'Dessert is not a plus one. Growth.', replies: [{ authorId: 'layla-baker', body: 'The dress understood the assignment. He did not.' }] },
      { authorId: 'sapphire-paggie', body: 'Steam the dress. Steam the standards. I am clapping.' },
    ],
  },
  {
    authorId: 'clara-christopher',
    body: "Posted a story: 49 days energy. Fiona replied “count better”. I replied “count tickets”. The blog writes itself.",
    scene: 'city',
    hashtags: ['XoralParty', 'Sept30', 'TheOtherSide', 'GetTickets'],
    thread: [
      { authorId: 'fiona-matthew', body: 'I said what I said. Maths is a look.', replies: [{ authorId: 'clara-christopher', body: 'And yet the screenshot is performing.' }] },
      { authorId: 'sandra-rosewood', body: 'Count tickets. That is the only countdown that matters.' },
    ],
  },
  {
    authorId: 'lora-adams',
    body: "Field notes: Clark washed the car again. Spencer pretended not to notice. I noticed. The 30th is going to be cinema.",
    scene: 'city',
    hashtags: ['XoralParty', 'Sept30', 'TheOtherSide', 'Ikeja'],
    thread: [
      { authorId: 'spencer-hawk', body: 'I noticed. I chose peace.', replies: [{ authorId: 'clark-sylvester', body: 'Peace is jealous of the paint job.' }] },
      { authorId: 'layla-baker', body: 'Lora’s field notes are the real season finale.' },
    ],
  },
];

const LIVE_JABS = {
  male: [
    'This is crazy. Sept 30 will humble you.',
    'Say it again when the car is parked properly.',
    'Clark energy. We see you.',
    "I'm screenshotting this for the group chat.",
    'Play something else. Thank you.',
    'Leather does not make you mysterious. But continue.',
    'The 30th is coming. Drink water.',
  ],
  female: [
    'The dress better match this confidence 💅',
    'I said what I said. Compete fairly.',
    'Sept 30 is a runway. Do not come playing.',
    'This is going in the blog. Congratulations.',
    'Girls 2+ and a shared Uber. Be serious.',
    'Cute. Wear it on the 30th and stand next to me.',
    'The group chat is already on fire 😭',
  ],
};

function pick<T>(list: T[], n: number) {
  const i = Math.abs(Math.trunc(Number(n))) || 0;
  return list[i % list.length];
}

function authorById(id: string) {
  return FEED_AUTHORS.find((a) => a.id === id) ?? FEED_AUTHORS[0];
}

function others(authorId: string) {
  return FEED_AUTHORS.filter((a) => a.id !== authorId);
}

/** Stable clock so SSR and the first client render match. */
export const FEED_NOW = Date.parse('2026-08-12T16:40:00+01:00');

function nid(prefix: string, seed: number) {
  return `${prefix}-${Math.trunc(Number(seed)) || 0}`;
}

function sceneKeyFor(body: string): SceneKey {
  const t = body.toLowerCase();
  if (/car|whip|coupe|drive|valet|dealership/.test(t)) return 'cars';
  if (/dinner|date|restaurant/.test(t)) return 'dinner';
  if (/gym|run|pilates|legs day/.test(t)) return 'gym';
  if (/outfit|fit|dress|wear|heels|boots|mirror|styled|dressed|sequin/.test(t)) return 'fashion';
  if (/red carpet/.test(t)) return 'redcarpet';
  if (/ambiance|ikeja/.test(t)) return 'club';
  if (/lagos|city|night drive/.test(t)) return 'city';
  if (/playlist|aux|loud|music|studio|mix/.test(t)) return 'dj';
  if (/table|vip|corner/.test(t)) return 'vip';
  if (/ticket|selling/.test(t)) return 'door';
  if (/portal|other side|two worlds|vol/.test(t)) return 'neon';
  if (/party|chaos|pulling|dance/.test(t)) return 'party';
  return 'party';
}

/** Fast CDN photo matched to the caption — not a character portrait. */
export function feedImageUrl(body: string, seed: number, scene?: SceneKey) {
  const s = Math.max(1, Math.trunc(Number(seed)) || 1);
  const pool = SCENE_PHOTOS[scene ?? sceneKeyFor(body)];
  const id = pick(pool, s);
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&h=800&q=60`;
}

export function hashtagsFor(body: string) {
  const t = body.toLowerCase();
  const fromText = [...body.matchAll(/#([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  const auto: string[] = ['XoralParty', 'Sept30'];
  if (/outfit|fit|dress|wear|mirror|heels|boots|sequin/.test(t)) auto.push('NightLook');
  if (/car|whip|coupe|drive/.test(t)) auto.push('Whip');
  if (/dinner|date/.test(t)) auto.push('DinnerDate');
  if (/blog|update|voice note/.test(t)) auto.push('TheOtherSide');
  if (/red carpet/.test(t)) auto.push('RedCarpet');
  if (/ambiance/.test(t)) auto.push('Ambiance');
  if (/ikeja/.test(t)) auto.push('Ikeja');
  if (/lagos/.test(t)) auto.push('LagosNights');
  if (/table|vip/.test(t)) auto.push('VIP');
  if (/playlist|aux|studio/.test(t)) auto.push('OnTheAux');
  if (/ticket|2\+|girls/.test(t)) auto.push('GetTickets');
  if (/party|dance/.test(t)) auto.push('PartyNight');
  if (!auto.includes('LagosNights') && !auto.includes('Ikeja')) auto.push('XoralUniverse');

  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [...fromText, ...auto]) {
    const key = tag.replace(/^#/, '');
    if (!key || seen.has(key.toLowerCase())) continue;
    seen.add(key.toLowerCase());
    out.push(key);
  }
  return out.slice(0, 6);
}

export function captionText(body: string) {
  return body.replace(/(?:^|\s)#[A-Za-z0-9_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildThread(script: ScriptPost, seed: number, createdAt: number): FeedComment[] {
  return script.thread.map((comment, i) => ({
    id: nid('c', seed * 17 + i + 1),
    author: authorById(comment.authorId),
    body: comment.body,
    likes: 6 + ((seed + i) % 90),
    likedByMe: false,
    createdAt: createdAt + (i + 1) * 120000,
    replies: (comment.replies ?? []).map((reply, r) => ({
      id: nid('r', seed * 31 + i * 5 + r + 1),
      author: authorById(reply.authorId),
      body: reply.body,
      likes: 3 + ((seed + r) % 40),
      likedByMe: false,
      createdAt: createdAt + (i + 1) * 120000 + (r + 1) * 60000,
    })),
  }));
}

function postFromScript(script: ScriptPost, seed: number, createdAt: number, id?: string, scriptIndex = 0): FeedPost {
  const author = authorById(script.authorId);
  const photoId = UNIQUE_PHOTOS[scriptIndex] ?? UNIQUE_PHOTOS[seed % UNIQUE_PHOTOS.length];
  return {
    id: id ?? nid('p', seed),
    author,
    body: script.body,
    image: unsplash(photoId),
    hashtags: script.hashtags,
    likes: 40 + (seed % 380),
    reposts: 4 + (seed % 70),
    likedByMe: false,
    repostedByMe: false,
    createdAt,
    comments: buildThread(script, seed, createdAt),
  };
}

function postKey(authorId: string, body: string) {
  return `${authorId}::${body}`;
}

function isTaken(script: ScriptPost, index: number, seenBody: Set<string>, seenImage: Set<string>) {
  if (seenBody.has(postKey(script.authorId, script.body))) return true;
  const image = unsplash(UNIQUE_PHOTOS[index] ?? UNIQUE_PHOTOS[0]);
  return seenImage.has(image);
}

export function makePost(seed: number): FeedPost {
  const s = Math.max(1, Math.trunc(Number(seed)) || 1);
  const idx = (s - 1) % SCRIPT_POSTS.length;
  const script = SCRIPT_POSTS[idx];
  const createdAt = FEED_NOW - (s % 36) * 3600000;
  return postFromScript(script, s, createdAt, undefined, idx);
}

export function nextLivePosts(n: number, existing: FeedPost[], mode: 'append' | 'prepend' = 'append'): FeedPost[] {
  const seenBody = new Set(existing.map((p) => postKey(p.author.id, p.body)));
  const seenImage = new Set(existing.map((p) => p.image).filter(Boolean) as string[]);
  const neighbor = mode === 'append' ? existing[existing.length - 1]?.author.id : existing[0]?.author.id;
  const out: FeedPost[] = [];
  let seq = 2000 + existing.length;

  const take = (allowSameAuthor: boolean) => {
    for (let i = 0; i < SCRIPT_POSTS.length && out.length < n; i++) {
      const script = SCRIPT_POSTS[i];
      if (isTaken(script, i, seenBody, seenImage)) continue;
      const prevAuthor = mode === 'prepend' && out.length === 0
        ? neighbor
        : out.length
          ? out[out.length - 1].author.id
          : neighbor;
      if (!allowSameAuthor && script.authorId === prevAuthor) continue;
      seq += 1;
      const post = postFromScript(script, seq, Date.now(), `p-live-${seq}-${i}`, i);
      seenBody.add(postKey(script.authorId, script.body));
      if (post.image) seenImage.add(post.image);
      out.push(post);
    }
  };

  take(false);
  if (out.length < n) take(true);
  return out;
}

export function seedFeed(count = 8): FeedPost[] {
  const posts: FeedPost[] = [];
  for (let i = 0; i < Math.min(count, SCRIPT_POSTS.length); i++) {
    posts.push(postFromScript(SCRIPT_POSTS[i], i + 1, FEED_NOW - i * 2.5 * 3600000, nid('p', i + 1), i));
  }
  return posts;
}

export function liveCharacterComment(post: FeedPost): FeedComment | null {
  const used = new Set(post.comments.map((c) => postKey(c.author.id, c.body)));
  const pool = others(post.author.id);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const author of shuffled) {
    const jabs = [...LIVE_JABS[author.gender]].sort(() => Math.random() - 0.5);
    const body = jabs.find((line) => !used.has(postKey(author.id, line)));
    if (!body) continue;
    return {
      id: `live-c-${Date.now()}-${author.id}`,
      author,
      body,
      likes: 1,
      likedByMe: false,
      createdAt: Date.now(),
      replies: [],
    };
  }
  return null;
}

export function liveBump(n: number) {
  if (n < 40) return n + 1;
  if (Math.random() < 0.55) return n + 1;
  if (Math.random() < 0.2) return n + 2;
  return n;
}

export function formatFeedTime(ts: number, now = FEED_NOW) {
  const diff = Math.max(0, now - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function countThread(comments: FeedComment[]) {
  return comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);
}

function oneOf(lines: string[]) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function snippet(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= 28) return clean;
  return `${clean.slice(0, 26).trim()}…`;
}

export function pickFeedAuthor() {
  return FEED_AUTHORS[Math.floor(Math.random() * FEED_AUTHORS.length)];
}

export function replyDelayMs() {
  return 3200 + Math.floor(Math.random() * 2800);
}

/** Contextual, playful reply from a Xoral character. */
export function characterReplyTo(userText: string) {
  const t = userText.toLowerCase();
  const bit = snippet(userText);

  if (/who dey reply|who is reply|who just reply|who dey talk|wait oo|una dey see/.test(t)) {
    return oneOf([
      `Me na 😭 you typed “${bit}” and thought this side was quiet?`,
      'It is me ooo. We live here. Sept 30 is just the crossover 👀✨',
    ]);
  }

  if (/sept|30th|xoral|ticket|buy|vip|table/.test(t)) {
    return oneOf([
      'Sept 30. Ambiance. Ikeja. Stop playing 🎟️🔥',
      `You said “${bit}”… girls already grabbing the 2+ rate. Be smart 💅`,
      'Get the ticket first, then talk. The 30th does not wait 😌',
    ]);
  }

  if (/car|whip|drive|coupe/.test(t)) {
    return oneOf([
      'The car is cute. Can you park it on the 30th though 😭',
      'Clark is going to take this personally. I support that.',
    ]);
  }

  if (/outfit|fit|wear|dress|heels|look/.test(t)) {
    return oneOf([
      'The fit better match Sept 30. Fiona is competing and she is not kind 👗✨',
      `“${bit}” — okay stylist. Mirror check, then Ambiance 🔥`,
    ]);
  }

  if (/clark|not staying|leaving/.test(t)) {
    return oneOf([
      'Clark energy. We both know he is not leaving early 😂',
      'Lora already has a blog chapter about this. Rest.',
    ]);
  }

  if (/see you|coming|on my way|pulling up|i dey come/.test(t)) {
    return oneOf([
      `“${bit}” — we heard you. Save it for the 30th 💃🔥`,
      'Come through 30 September. The other side already knows your name ✨🥂',
    ]);
  }

  if (/love|fine|beautiful|handsome|crush/.test(t)) {
    return oneOf([
      'Easy 😳 we have Sept 30 to survive first.',
      'Flirting in the feed? Fiona is watching 😏✨',
    ]);
  }

  if (/\?/.test(t)) {
    return oneOf([
      `You asked “${bit}” — short answer: yes. Sept 30. Come 😌`,
      'Good question. Better answer: get your ticket 🎟️',
    ]);
  }

  return oneOf([
    `Okay I heard “${bit}” 👀 we are living from the other side till the 30th.`,
    `“${bit}” — say it again at Ambiance. Louder. 🔊✨`,
    `Noted. You said “${bit}”. Now come prove it on Sept 30 😏🔥`,
  ]);
}
