-- XORAL PARTY live checkout, tickets, and sales team.
-- Run in the Supabase SQL editor before going live on Vercel.
-- Service role only (no public policies). The app uses SUPABASE_SERVICE_ROLE_KEY.

create table if not exists party_live_orders (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists party_live_tickets (
  id text primary key,
  order_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists party_live_people (
  id text primary key,
  email text unique not null,
  code text unique not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists party_live_sessions (
  token text primary key,
  person_id text not null,
  expires_at timestamptz not null,
  data jsonb not null
);

create table if not exists party_live_sales (
  id text primary key,
  order_id text unique not null,
  person_id text not null,
  vendor_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists party_live_tickets_order on party_live_tickets(order_id);
create index if not exists party_live_sales_vendor on party_live_sales(vendor_id);
create index if not exists party_live_sales_person on party_live_sales(person_id);

alter table party_live_orders enable row level security;
alter table party_live_tickets enable row level security;
alter table party_live_people enable row level security;
alter table party_live_sessions enable row level security;
alter table party_live_sales enable row level security;
