-- XORAL user data schema — run in Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text not null default 'Free',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Anyone can view public profile fields"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Watchlist
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, title_slug)
);

alter table public.watchlist enable row level security;

create policy "Users manage own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Watched
create table if not exists public.watched (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title_slug text not null,
  watched_at timestamptz not null default now(),
  unique (user_id, title_slug)
);

alter table public.watched enable row level security;

create policy "Users manage own watched"
  on public.watched for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Follows (creators + AI Stars)
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('creator', 'character')),
  target_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

alter table public.follows enable row level security;

create policy "Users manage own follows"
  on public.follows for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Community posts
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  likes integer not null default 0,
  comments integer not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

create policy "Anyone can read community posts"
  on public.community_posts for select
  using (true);

create policy "Users manage own community posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users update own community posts"
  on public.community_posts for update
  using (auth.uid() = user_id);

-- Like posts via RPC (avoids RLS blocking likes on other users' posts)
create or replace function public.like_community_post(post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set likes = likes + 1
  where id = post_id;
end;
$$;

grant execute on function public.like_community_post(uuid) to authenticated;
grant execute on function public.like_community_post(uuid) to anon;

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed welcome notification for new users
create or replace function public.seed_user_notifications()
returns trigger as $$
begin
  insert into public.notifications (user_id, title, message, read) values
    (new.id, 'Welcome to XORAL', 'Your account is ready. Start exploring AI cinema.', false);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created_notifications on public.profiles;
create trigger on_profile_created_notifications
  after insert on public.profiles
  for each row execute procedure public.seed_user_notifications();
