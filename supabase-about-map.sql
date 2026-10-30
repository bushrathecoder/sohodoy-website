-- ============================================================
--  SOHODOY "ABOUT + MAP" DATABASE SETUP
--  Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
--  Run it AFTER supabase-setup.sql (it uses the admin rule from there).
-- ============================================================

-- "What makes us different" cards
create table differentiators (
  id uuid primary key default gen_random_uuid(),
  title text not null,             -- e.g. "Youth-led"
  description text,                -- one or two lines
  sort int not null default 1,
  created_at timestamptz not null default now()
);

-- Pins on the map of Bangladesh
create table map_pins (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- e.g. "Dhaka"
  description text,                -- e.g. "Peace workshops in schools"
  district text,                   -- one of the 64 districts (optional if you give exact position)
  latitude double precision,       -- optional exact position
  longitude double precision,
  sort int not null default 1,
  created_at timestamptz not null default now()
);

alter table differentiators enable row level security;
alter table map_pins enable row level security;

create policy "public read" on differentiators for select using (true);
create policy "admin write" on differentiators for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on map_pins for select using (true);
create policy "admin write" on map_pins for all using (public.is_admin()) with check (public.is_admin());
