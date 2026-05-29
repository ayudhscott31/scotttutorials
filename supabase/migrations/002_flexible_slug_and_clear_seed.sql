-- Run only if you already applied the older schema with enum + seed data

-- Allow any platform slug
alter table public.platforms alter column slug type text using slug::text;
drop type if exists public.platform_slug;

-- Default new content to unpublished until you publish
alter table public.platforms alter column is_published set default false;
alter table public.sections alter column is_published set default false;
alter table public.tutorials alter column is_published set default false;

-- Optional: wipe seed data and start fresh
-- truncate public.tutorials, public.sections, public.platforms cascade;
