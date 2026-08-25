-- XORAL PARTY — run in Supabase SQL Editor before live ticket sales.
-- Until this is applied, the /party site uses clearly marked mock event data.

create table if not exists party_events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  volume text not null,
  tagline text not null default 'ONE PARTY. TWO WORLDS.',
  subtagline text,
  description text,
  starts_at timestamptz not null,
  doors_open_at timestamptz not null,
  ends_at timestamptz not null,
  venue text not null,
  address text,
  city text not null,
  maps_url text,
  dress_code text,
  age_requirement text,
  hero_artwork text,
  sale_opens_at timestamptz,
  sale_closes_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists party_ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references party_events(id) on delete cascade,
  name text not null,
  slug text not null,
  price_kobo integer not null check (price_kobo >= 0),
  currency text not null default 'NGN',
  description text,
  benefits jsonb not null default '[]'::jsonb,
  capacity integer not null check (capacity >= 0),
  remaining integer not null check (remaining >= 0),
  max_per_customer integer not null default 4,
  sale_starts_at timestamptz,
  sale_ends_at timestamptz
);

create table if not exists party_orders (
  id text primary key,
  event_id uuid not null references party_events(id),
  email text not null,
  full_name text not null,
  phone text not null,
  gender text,
  date_of_birth date,
  referral_code text,
  promo_code text,
  instagram text,
  show_on_guest_wall boolean not null default false,
  items jsonb not null,
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  total_kobo integer not null,
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now()
);

create table if not exists party_tickets (
  id text primary key,
  order_id text not null references party_orders(id),
  event_id uuid not null references party_events(id),
  ticket_type_id uuid not null references party_ticket_types(id),
  ticket_type_name text not null,
  guest_name text not null,
  qr_payload text not null unique,
  checked_in_at timestamptz
);

create unique index if not exists party_tickets_one_checkin on party_tickets(id) where checked_in_at is not null;

create table if not exists party_checkins (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references party_tickets(id),
  checked_in_at timestamptz not null default now(),
  staff_note text
);

create table if not exists party_promo_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references party_events(id) on delete cascade,
  code text not null,
  percent_off integer,
  amount_off_kobo integer,
  max_uses integer,
  used_count integer not null default 0
);

create table if not exists party_referrals (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_email text,
  tickets_sold integer not null default 0
);

create table if not exists party_ambassadors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text,
  role text,
  status text not null default 'applied'
);

create table if not exists party_character_posts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references party_events(id) on delete cascade,
  character_slug text not null,
  character_name text not null,
  body text not null,
  posted_at timestamptz not null default now()
);

create table if not exists party_gallery (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references party_events(id) on delete cascade,
  category text not null,
  kind text not null,
  src text not null,
  alt text,
  orientation text
);

create table if not exists party_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  logo_url text
);

create table if not exists party_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table party_events enable row level security;
alter table party_ticket_types enable row level security;
alter table party_orders enable row level security;
alter table party_tickets enable row level security;
alter table party_checkins enable row level security;
alter table party_promo_codes enable row level security;
alter table party_referrals enable row level security;
alter table party_ambassadors enable row level security;
alter table party_character_posts enable row level security;
alter table party_gallery enable row level security;
alter table party_partners enable row level security;
alter table party_audit_logs enable row level security;
