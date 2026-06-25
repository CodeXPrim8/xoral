-- Fixes: duplicate key value violates unique constraint "cms_hero_pkey"
-- Run in Supabase SQL Editor (safe to re-run)

create sequence if not exists cms_hero_id_seq;
alter table public.cms_hero alter column id set default nextval('cms_hero_id_seq');

select setval(
  'cms_hero_id_seq',
  (select coalesce(max(id), 1) from public.cms_hero),
  true
);
