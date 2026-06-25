-- =============================================================================
-- COPY ALL OF THIS FILE (Ctrl+A, Ctrl+C) AND PASTE INTO SUPABASE SQL EDITOR.
-- Do NOT paste the file path or filename — paste the SQL below only.
-- https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new
-- Run cms-schema.sql first if you have not already.
-- =============================================================================

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
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage episodes" on public.cms_episodes;
create policy "Admin manage episodes"
  on public.cms_episodes for all
  using (public.is_admin()) with check (public.is_admin());
