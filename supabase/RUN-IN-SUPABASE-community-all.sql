-- =============================================================================
-- COPY ALL OF THIS → paste in Supabase SQL Editor → Run
-- Adds ALL community columns (video, music, post/short, profiles, subscriptions)
-- https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new
-- =============================================================================

-- Profile fields
alter table public.profiles
  add column if not exists bio text,
  add column if not exists banner_url text;

-- Step 1: media columns (from RUN-IN-SUPABASE-community.sql)
alter table public.community_posts
  add column if not exists video_url text;

alter table public.community_posts
  add column if not exists media_type text default 'text';

update public.community_posts
set media_type = 'text'
where media_type is null;

alter table public.community_posts
  alter column media_type set default 'text';

alter table public.community_posts
  alter column content drop not null;

alter table public.community_posts
  drop constraint if exists community_posts_media_type_check;

alter table public.community_posts
  add constraint community_posts_media_type_check
  check (media_type in ('text', 'image', 'video'));

-- Step 2: post vs short + music + trim (from community-v2)
alter table public.community_posts
  add column if not exists post_kind text default 'post',
  add column if not exists music_url text,
  add column if not exists video_trim_start real default 0,
  add column if not exists video_trim_end real;

update public.community_posts
set post_kind = 'post'
where post_kind is null;

alter table public.community_posts
  drop constraint if exists community_posts_post_kind_check;

alter table public.community_posts
  add constraint community_posts_post_kind_check
  check (post_kind in ('post', 'short'));

-- Subscriptions
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
  on public.user_follows for select using (true);

drop policy if exists "Users manage own follows" on public.user_follows;
create policy "Users manage own follows"
  on public.user_follows for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- Storage for community uploads
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

-- Subscriber count
create or replace function public.subscriber_count(target_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.user_follows where following_id = target_user_id;
$$;

grant execute on function public.subscriber_count(uuid) to anon, authenticated;
