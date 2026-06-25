-- Run in Supabase SQL Editor to enable multiple hero banner slides.
-- Safe to re-run.

alter table public.cms_hero drop constraint if exists cms_hero_id_check;

alter table public.cms_hero add column if not exists sort_order integer not null default 0;
alter table public.cms_hero add column if not exists is_active boolean not null default true;
alter table public.cms_hero add column if not exists created_at timestamptz not null default now();

-- Convert fixed id=1 table to serial ids (keeps existing row).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cms_hero'
      and column_name = 'id'
      and column_default is null
  ) then
    create sequence if not exists cms_hero_id_seq;
    alter table public.cms_hero alter column id set default nextval('cms_hero_id_seq');
    perform setval('cms_hero_id_seq', coalesce((select max(id) from public.cms_hero), 1));
  end if;
exception
  when others then null;
end $$;

update public.cms_hero set sort_order = id where sort_order = 0;

-- RLS: allow authenticated admins to insert/update/delete hero slides
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

drop policy if exists "Admin manage hero" on public.cms_hero;
create policy "Admin manage hero"
  on public.cms_hero for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Fix id sequence after migration (prevents duplicate key on cms_hero_pkey)
create sequence if not exists cms_hero_id_seq;
alter table public.cms_hero alter column id set default nextval('cms_hero_id_seq');
select setval(
  'cms_hero_id_seq',
  (select coalesce(max(id), 1) from public.cms_hero),
  true
);
