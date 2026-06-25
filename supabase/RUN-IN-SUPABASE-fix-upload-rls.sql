-- =============================================================================
-- COPY ALL OF THIS (Ctrl+A, Ctrl+C) → paste in Supabase SQL Editor → Run
-- Fixes: "new row violates row-level security policy" on video upload
-- https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new
-- =============================================================================

-- Ensure admin role column exists
alter table public.profiles
  add column if not exists role text not null default 'user';

-- Recreate admin helper (used by CMS + storage policies)
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

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- Make sure your account is admin (change email if needed)
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'iwewezinemstephen@gmail.com'
);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

-- Storage: public read
drop policy if exists "Public read cms media" on storage.objects;
create policy "Public read cms media"
  on storage.objects for select
  using (bucket_id = 'cms-media');

-- Storage: admin upload / update / delete (explicit check works better than is_admin() alone)
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

-- Episodes & seasons: admin write access
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

-- Verify (should show role = admin for your email)
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id
where u.email = 'iwewezinemstephen@gmail.com';
