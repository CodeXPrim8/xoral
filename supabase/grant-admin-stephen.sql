-- XORAL Super Admin — run in Supabase SQL Editor AFTER you have signed up once at /signup
-- https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new

-- Ensure CMS schema is applied first (run cms-schema.sql if you have not already).

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'iwewezinemstephen@gmail.com'
);

-- Verify (should return one row with role = admin):
SELECT p.id, u.email, p.display_name, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'iwewezinemstephen@gmail.com';
