-- ============================================================
--  SOHODOY DATABASE SETUP
--  Run this ONCE in Supabase (SETUP-GUIDE.md, Step 2).
--  BEFORE running: change PUT-YOUR-EMAIL-HERE to the
--  email address you will use to log in to the admin panel.
--  Keep the quote marks.
-- ============================================================

-- Who is the admin? Only this email can add, edit or delete content.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('PUT-YOUR-EMAIL-HERE')
$$;

-- ---------- Tables ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  sort int not null default 1,
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  image_url text,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table donation_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  details text,
  link text,
  button_label text,
  sort int not null default 1
);

create table settings (
  key text primary key,
  value text
);

create table join_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 200),
  email text not null check (char_length(email) <= 200),
  message text check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

-- ---------- Security rules ----------
-- Everyone can READ the website content. Only the admin can CHANGE it.
alter table projects enable row level security;
alter table posts enable row level security;
alter table donation_methods enable row level security;
alter table settings enable row level security;
alter table join_requests enable row level security;

create policy "public read" on projects for select using (true);
create policy "admin write" on projects for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on posts for select using (true);
create policy "admin write" on posts for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on donation_methods for select using (true);
create policy "admin write" on donation_methods for all using (public.is_admin()) with check (public.is_admin());

create policy "public read" on settings for select using (true);
create policy "admin write" on settings for all using (public.is_admin()) with check (public.is_admin());

-- Visitors may send a join request, but only the admin can read or delete them.
create policy "anyone can send" on join_requests for insert with check (true);
create policy "admin manage" on join_requests for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Picture storage ----------
insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict (id) do nothing;

create policy "public view images" on storage.objects for select using (bucket_id = 'images');
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'images' and public.is_admin());
create policy "admin change images" on storage.objects for update using (bucket_id = 'images' and public.is_admin());
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'images' and public.is_admin());

-- ---------- Starting text (you can change all of this in the admin panel) ----------
insert into settings (key, value) values
  ('hero_headline', 'A youth-led initiative building a peaceful, inclusive and just society'),
  ('hero_text', 'Through community-based awareness and educational activities, we empower children, young people and underserved communities, and promote human rights and peaceful coexistence.'),
  ('about_1', 'Sohodoy is a youth-led humanitarian initiative. We promote peaceful coexistence, human rights and sustainable peace through community-based awareness and educational activities.'),
  ('about_2', 'Our mission is to empower children, young people and underserved communities to build a more inclusive, just and peaceful society.'),
  ('donate_heading', 'Support our work'),
  ('donate_text', 'Donation details will be published soon.'),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('contact_address', '')
on conflict (key) do nothing;
