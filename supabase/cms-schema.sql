-- XORAL CMS schema — run AFTER schema.sql in Supabase SQL Editor

-- Admin role on profiles
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- AI Stars / characters
create table if not exists public.cms_characters (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  gender text not null default 'female' check (gender in ('male', 'female')),
  age integer,
  nationality text not null default '',
  height text not null default '',
  eyes text not null default '',
  hair text not null default '',
  personality text not null default '',
  style text not null default '',
  voice text not null default '',
  profession text not null default '',
  skin_color text not null default '',
  description text not null default '',
  image_url text not null default '/placeholder-user.jpg',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Titles (movies & series)
create table if not exists public.cms_titles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  image_url text not null default '/placeholder.jpg',
  rating numeric(3,1) not null default 0,
  type text not null default 'movie' check (type in ('movie', 'ai', 'series')),
  description text not null default '',
  genre text not null default '',
  maturity_rating integer not null default 13,
  is_ai_generated boolean not null default false,
  subtitle text,
  trailer_url text,
  video_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_title_cast (
  title_id uuid not null references public.cms_titles(id) on delete cascade,
  character_id uuid not null references public.cms_characters(id) on delete cascade,
  primary key (title_id, character_id)
);

-- Featured creators
create table if not exists public.cms_creators (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  image_url text not null default '/placeholder-user.jpg',
  followers text not null default '0',
  specialization text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Home hero slides (admin can add many)
create table if not exists public.cms_hero (
  id serial primary key,
  title_slug text,
  subtitle text,
  description text,
  image_url text not null default '/posters/xoral-hero.svg',
  rating integer not null default 16,
  category text not null default 'Drama',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.cms_hero (title_slug, sort_order)
select null, 0
where not exists (select 1 from public.cms_hero);

-- Home page sections
create table if not exists public.cms_sections (
  id text primary key,
  label text not null,
  subtitle text,
  sort_order integer not null default 0
);

insert into public.cms_sections (id, label, subtitle, sort_order) values
  ('next_watch', 'Your Next Watch', null, 1),
  ('trending', 'Trending Now', 'What everyone is watching right now', 2),
  ('ai_originals', 'AI Generated Originals', 'Experience cinema created by artificial intelligence on XORAL', 3)
on conflict (id) do nothing;

create table if not exists public.cms_section_items (
  section_id text not null references public.cms_sections(id) on delete cascade,
  title_id uuid not null references public.cms_titles(id) on delete cascade,
  sort_order integer not null default 0,
  progress integer,
  episode_label text,
  primary key (section_id, title_id)
);

-- RLS
alter table public.cms_characters enable row level security;
alter table public.cms_titles enable row level security;
alter table public.cms_title_cast enable row level security;
alter table public.cms_creators enable row level security;
alter table public.cms_hero enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_section_items enable row level security;

-- Public read published content (drop first so this script is safe to re-run)
drop policy if exists "Public read published characters" on public.cms_characters;
create policy "Public read published characters"
  on public.cms_characters for select using (published = true or public.is_admin());

drop policy if exists "Public read published titles" on public.cms_titles;
create policy "Public read published titles"
  on public.cms_titles for select using (published = true or public.is_admin());

drop policy if exists "Public read title cast" on public.cms_title_cast;
create policy "Public read title cast"
  on public.cms_title_cast for select using (true);

drop policy if exists "Public read published creators" on public.cms_creators;
create policy "Public read published creators"
  on public.cms_creators for select using (published = true or public.is_admin());

drop policy if exists "Public read hero" on public.cms_hero;
create policy "Public read hero" on public.cms_hero for select using (true);

drop policy if exists "Public read sections" on public.cms_sections;
create policy "Public read sections" on public.cms_sections for select using (true);

drop policy if exists "Public read section items" on public.cms_section_items;
create policy "Public read section items" on public.cms_section_items for select using (true);

-- Admin write
drop policy if exists "Admin manage characters" on public.cms_characters;
create policy "Admin manage characters"
  on public.cms_characters for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage titles" on public.cms_titles;
create policy "Admin manage titles"
  on public.cms_titles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage title cast" on public.cms_title_cast;
create policy "Admin manage title cast"
  on public.cms_title_cast for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage creators" on public.cms_creators;
create policy "Admin manage creators"
  on public.cms_creators for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage hero" on public.cms_hero;
create policy "Admin manage hero"
  on public.cms_hero for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage sections" on public.cms_sections;
create policy "Admin manage sections"
  on public.cms_sections for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage section items" on public.cms_section_items;
create policy "Admin manage section items"
  on public.cms_section_items for all
  using (public.is_admin()) with check (public.is_admin());

-- Storage bucket for CMS media
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read cms media" on storage.objects;
create policy "Public read cms media"
  on storage.objects for select
  using (bucket_id = 'cms-media');

drop policy if exists "Admin upload cms media" on storage.objects;
create policy "Admin upload cms media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cms-media'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admin update cms media" on storage.objects;
create policy "Admin update cms media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cms-media'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    bucket_id = 'cms-media'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admin delete cms media" on storage.objects;
create policy "Admin delete cms media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cms-media'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Make yourself admin (replace with your account email after signup):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@email.com');

-- ---------------------------------------------------------------------------
-- Seasons & episodes (required for series uploads)
-- Or run supabase/episodes-schema.sql separately if you already ran cms-schema.
-- ---------------------------------------------------------------------------

create table if not exists public.cms_seasons (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.cms_titles(id) on delete cascade,
  season_number integer not null check (season_number >= 1),
  title text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title_id, season_number)
);

create table if not exists public.cms_episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.cms_seasons(id) on delete cascade,
  episode_number integer not null check (episode_number >= 1),
  title text not null,
  description text not null default '',
  video_url text,
  trailer_url text,
  duration_minutes integer,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, episode_number)
);

create index if not exists cms_seasons_title_id_idx on public.cms_seasons(title_id);
create index if not exists cms_episodes_season_id_idx on public.cms_episodes(season_id);

alter table public.cms_seasons enable row level security;
alter table public.cms_episodes enable row level security;

drop policy if exists "Public read seasons" on public.cms_seasons;
create policy "Public read seasons"
  on public.cms_seasons for select using (true);

drop policy if exists "Public read published episodes" on public.cms_episodes;
create policy "Public read published episodes"
  on public.cms_episodes for select
  using (published = true or public.is_admin());

drop policy if exists "Admin manage seasons" on public.cms_seasons;
create policy "Admin manage seasons"
  on public.cms_seasons for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admin manage episodes" on public.cms_episodes;
create policy "Admin manage episodes"
  on public.cms_episodes for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
