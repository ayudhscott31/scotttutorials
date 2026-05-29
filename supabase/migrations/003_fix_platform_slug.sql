-- =============================================================================
-- FIX: "Database schema mismatch" / 400 on platforms INSERT
-- Paste ALL of this into Supabase → SQL Editor → Run
-- Safe to run more than once
-- =============================================================================

-- 1) Change platforms.slug from enum → text (fixes error code 22P02)
alter table public.platforms
  alter column slug type text using slug::text;

drop type if exists public.platform_slug;

-- 2) Slug format rule (lowercase + hyphens only)
alter table public.platforms drop constraint if exists platforms_slug_format;
alter table public.platforms add constraint platforms_slug_format
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- 3) Same for sections (if you hit errors there later)
alter table public.sections drop constraint if exists sections_slug_format;
alter table public.sections add constraint sections_slug_format
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- 4) Verify column type (should show: text)
select column_name, data_type, udt_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'platforms'
  and column_name = 'slug';

-- 5) Add yourself as admin — REPLACE the UUID below
--    Supabase → Authentication → Users → copy User UID
/*
insert into public.admin_users (user_id)
values ('PASTE-YOUR-USER-UUID-HERE')
on conflict (user_id) do nothing;
*/
