-- Run in Supabase SQL Editor after RUN-IN-SUPABASE-hero-slides.sql
-- Fixes: "new row violates row-level security policy" on cms_hero

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

-- Ensure your account is admin (change email if needed)
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'iwewezinemstephen@gmail.com'
);

drop policy if exists "Admin manage hero" on public.cms_hero;
create policy "Admin manage hero"
  on public.cms_hero for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Verify
select u.email, p.role
from auth.users u
join public.profiles p on p.id = u.id
where u.email = 'iwewezinemstephen@gmail.com';
