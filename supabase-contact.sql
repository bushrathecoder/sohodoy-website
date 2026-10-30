-- ============================================================
--  SOHODOY "CONTACT" PAGE DATABASE SETUP
--  Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
--  Run it AFTER supabase-setup.sql (it uses the admin rule from there).
-- ============================================================

-- Social media links (LinkedIn, Facebook, Instagram, YouTube...)
create table social_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- e.g. "LinkedIn"
  url text not null,               -- e.g. https://linkedin.com/company/sohodoy
  sort int not null default 1,
  created_at timestamptz not null default now()
);

-- Messages sent from the "Send us a message" form
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 200),
  email text not null check (char_length(email) <= 200),
  message text not null check (char_length(message) <= 3000),
  created_at timestamptz not null default now()
);

alter table social_links enable row level security;
alter table contact_messages enable row level security;

-- Everyone can see the social links. Only the admin can change them.
create policy "public read" on social_links for select using (true);
create policy "admin write" on social_links for all using (public.is_admin()) with check (public.is_admin());

-- Anyone can send a message, but only the admin can read or delete them.
create policy "anyone can send" on contact_messages for insert with check (true);
create policy "admin manage" on contact_messages for all using (public.is_admin()) with check (public.is_admin());
