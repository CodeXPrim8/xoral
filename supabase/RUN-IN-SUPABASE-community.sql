-- =============================================================================
-- COPY ALL OF THIS → paste in Supabase SQL Editor → Run
-- TikTok-style community: media posts + user follows
-- https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new
-- =============================================================================

-- Media columns on community posts
alter table public.community_posts
  add column if not exists video_url text,
  add column if not exists media_type text not null default 'text';

alter table public.community_posts
  alter column content drop not null;

alter table public.community_posts
  drop constraint if exists community_posts_media_type_check;

alter table public.community_posts
  add constraint community_posts_media_type_check
  check (media_type in ('text', 'image', 'video'));

-- User-to-user follows (Following tab)
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.user_follows enable row level security;

drop policy if exists "Anyone can read user follows" on public.user_follows;
create policy "Anyone can read user follows"
  on public.user_follows for select
  using (true);

drop policy if exists "Users manage own follows" on public.user_follows;
create policy "Users manage own follows"
  on public.user_follows for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- Community media uploads (authenticated users → community/ folder)
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

drop policy if exists "Community upload media" on storage.objects;
create policy "Community upload media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cms-media'
    and (storage.foldername(name))[1] = 'community'
  );
