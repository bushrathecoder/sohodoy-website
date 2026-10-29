-- ============================================================
--  SOHODOY "MEET THE HEROES" DATABASE SETUP
--  Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
--  Run it AFTER supabase-setup.sql (it uses the admin rule from there).
-- ============================================================

create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,                       -- e.g. "Founder", "Programs Lead"
  group_name text not null default 'core'
    check (group_name in ('founder', 'cofounder', 'core')),
  image_url text,                  -- photo
  bio text,
  email text,
  website_url text,                -- portfolio website or CV link
  facebook_url text,
  linkedin_url text,
  other_links text,                -- extra links, one per line: Label | https://link
  sort int not null default 1,
  created_at timestamptz not null default now()
);

-- Only ONE founder and ONE co-founder are allowed (core team can have many).
create unique index only_one_founder_and_cofounder
  on team_members (group_name) where group_name in ('founder', 'cofounder');

alter table team_members enable row level security;
create policy "public read" on team_members for select using (true);
create policy "admin write" on team_members for all using (public.is_admin()) with check (public.is_admin());
