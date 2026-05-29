-- =============================================================================
-- Run AFTER 003_fix_platform_slug.sql
-- 1. Supabase Dashboard → Authentication → Users
-- 2. Copy your User UID (UUID)
-- 3. Replace PASTE-YOUR-USER-UUID-HERE below
-- 4. Run this script
-- =============================================================================

insert into public.admin_users (user_id)
values ('PASTE-YOUR-USER-UUID-HERE')
on conflict (user_id) do nothing;

-- Should return one row with your user_id
select * from public.admin_users;
