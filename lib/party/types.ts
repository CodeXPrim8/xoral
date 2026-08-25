export type TicketAvailability = 'available' | 'selling_fast' | 'almost_gone' | 'sold_out';

export type TicketGender = 'male' | 'female';

export type GenderedPricing = {
  maleKobo: number;
  femaleKobo: number;
  /** Unit price when a girl buys 2 or more of this ticket type. */
  femaleMultiKobo: number;
};

export type TicketType = {
  id: string;
  name: string;
  slug: string;
  pricing: GenderedPricing;
  currency: 'NGN';
  description: string;
  benefits: string[];
  capacity: number;
  remaining: number;
  maxPerCustomer: number;
  saleStartsAt: string;
  saleEndsAt: string;
};

export type PartyEvent = {
  id: string;
  slug: string;
  name: string;
  volume: string;
  tagline: string;
  subtagline: string;
  description: string;
  startsAt: string;
  doorsOpenAt: string;
  endsAt: string;
  /** Public schedule line, e.g. red carpet and party start. */
  scheduleLabel: string;
  venue: string;
  address: string;
  city: string;
  mapsUrl: string;
  dressCode: string;
  ageRequirement: string;
  heroArtwork: string;
  saleOpensAt: string;
  saleClosesAt: string;
  ticketTypes: TicketType[];
  /** True while this event is served from local mock data, not live inventory. */
  isMock: boolean;
};

export type CharacterPost = {
  id: string;
  characterId: string;
  characterName: string;
  characterImage: string;
  body: string;
  postedAt: string;
};

export type PartyCharacter = {
  id: string;
  slug: string;
  name: string;
  role: string;
  personality: string;
  image: string;
  quote: string;
};

export type GalleryItem = {
  id: string;
  category: 'people' | 'energy' | 'fits' | 'moments';
  kind: 'photo' | 'video';
  src: string;
  alt: string;
  orientation: 'vertical' | 'horizontal';
};

export type Partner = {
  id: string;
  name: string;
  category: 'venue' | 'beverage' | 'media' | 'fashion' | 'mobility' | 'technology';
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type GuestWallEntry = {
  firstName: string;
  instagram?: string;
  image?: string;
};

export type PartyOrder = {
  id: string;
  eventId: string;
  email: string;
  fullName: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  referralCode?: string;
  promoCode?: string;
  instagram?: string;
  showOnGuestWall: boolean;
  items: CheckoutSelection[];
  status: 'pending' | 'paid' | 'failed';
  totalKobo: number;
  createdAt: string;
  paymentReference?: string;
  emailSentAt?: string;
};

export type PartyTicket = {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  guestName: string;
  qrPayload: string;
  checkedInAt: string | null;
};

export type CheckoutSelection = {
  ticketTypeId: string;
  quantity: number;
  gender: TicketGender;
};

export type SalesRole = 'vendor' | 'seller';

export type SalesPerson = {
  id: string;
  role: SalesRole;
  vendorId?: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  code: string;
  createdAt: string;
};

export type SalesSession = {
  token: string;
  personId: string;
  expiresAt: number;
};

export type SaleRecord = {
  id: string;
  orderId: string;
  personId: string;
  vendorId: string;
  attendees: number;
  amountKobo: number;
  commissionKobo: number;
  createdAt: string;
  guestName: string;
  guestEmail: string;
};
