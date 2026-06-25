-- =============================================================================
-- COPY ALL OF THIS → paste in Supabase SQL Editor → Run
-- YouTube-style community: Posts + Shorts, music, profiles, subscriptions
-- https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new
-- =============================================================================

-- Profile fields for public community pages
alter table public.profiles
  add column if not exists bio text,
  add column if not exists banner_url text;

-- Post vs Short + music / video edit metadata
alter table public.community_posts
  add column if not exists post_kind text not null default 'post',
  add column if not exists music_url text,
  add column if not exists video_trim_start real default 0,
  add column if not exists video_trim_end real;

alter table public.community_posts
  drop constraint if exists community_posts_post_kind_check;

alter table public.community_posts
  add constraint community_posts_post_kind_check
  check (post_kind in ('post', 'short'));

-- Subscriptions (subscriber → creator)
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

-- Media uploads
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

-- Subscriber count helper
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

-- Backfill older posts so they appear under Post (not Shorts)
update public.community_posts
set post_kind = 'post'
where post_kind is null;
