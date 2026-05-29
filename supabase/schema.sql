-- =============================================================================
-- Tutorial Hub — Supabase schema (empty database, no seed data)
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- =============================================================================

create extension if not exists "pgcrypto";

create type public.tutorial_type as enum ('video', 'document');

-- -----------------------------------------------------------------------------
-- Platforms (create any slug from dashboard)
-- -----------------------------------------------------------------------------
create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  emoji text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platforms_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- -----------------------------------------------------------------------------
-- Sections (profiles / categories / groupings per platform)
-- -----------------------------------------------------------------------------
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.platforms (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  color text not null default '#000000',
  bg_color text not null default '#F4FFD6',
  icon text not null default 'Folder',
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform_id, slug),
  constraint sections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index sections_platform_id_idx on public.sections (platform_id);
create index sections_published_idx on public.sections (is_published) where is_published = true;

-- -----------------------------------------------------------------------------
-- Tutorials
-- -----------------------------------------------------------------------------
create table public.tutorials (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  type public.tutorial_type not null,
  title text not null,
  description text,
  video_url text,
  poster_url text,
  duration text,
  document_url text,
  file_type text,
  file_size text,
  gradient_from text default '#000000',
  gradient_to text default '#3D3D3D',
  published_at date,
  sort_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tutorials_published_video check (
    is_published = false or type <> 'video' or (video_url is not null and video_url <> '')
  ),
  constraint tutorials_published_document check (
    is_published = false or type <> 'document' or (document_url is not null and document_url <> '')
  )
);

create index tutorials_section_id_idx on public.tutorials (section_id);
create index tutorials_published_idx on public.tutorials (is_published) where is_published = true;

-- -----------------------------------------------------------------------------
-- Admins
-- -----------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger platforms_set_updated_at before update on public.platforms
  for each row execute function public.set_updated_at();
create trigger sections_set_updated_at before update on public.sections
  for each row execute function public.set_updated_at();
create trigger tutorials_set_updated_at before update on public.tutorials
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.platforms enable row level security;
alter table public.sections enable row level security;
alter table public.tutorials enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create policy "platforms_select_published" on public.platforms for select using (is_published = true);
create policy "sections_select_published" on public.sections for select using (is_published = true);
create policy "tutorials_select_published" on public.tutorials for select using (is_published = true);

create policy "platforms_admin_all" on public.platforms for all
  using (public.is_admin()) with check (public.is_admin());
create policy "sections_admin_all" on public.sections for all
  using (public.is_admin()) with check (public.is_admin());
create policy "tutorials_admin_all" on public.tutorials for all
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_users_select_self" on public.admin_users for select
  using (user_id = auth.uid() or public.is_admin());
create policy "admin_users_bootstrap_first" on public.admin_users for insert
  with check (auth.uid() = user_id and not exists (select 1 from public.admin_users));
create policy "admin_users_insert_admin" on public.admin_users for insert
  with check (public.is_admin());
create policy "admin_users_delete_admin" on public.admin_users for delete
  using (public.is_admin());
