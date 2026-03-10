-- ============================================================
-- Hahu Marketplace — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- Project URL: https://app.supabase.com → SQL Editor → New Query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  full_name    text not null default '',
  city         text not null default '',
  phone        text,
  bio          text,
  avatar_url   text,
  is_provider  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);

alter table public.profiles enable row level security;
create policy "Profiles are publicly viewable"     on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = user_id);

-- ============================================================
-- 2. CATEGORIES (seed data)
-- ============================================================
create table if not exists public.categories (
  id         text primary key,
  label      text not null,
  emoji      text not null,
  sort_order int  not null default 0
);

insert into public.categories (id, label, emoji, sort_order) values
  ('cleaning',    'Cleaning',     '🧹', 1),
  ('moving',      'Moving Help',  '📦', 2),
  ('babysitting', 'Babysitting',  '👶', 3),
  ('translation', 'Translation',  '🌍', 4),
  ('tutoring',    'Tutoring',     '📚', 5),
  ('cooking',     'Cooking',      '🍽️', 6),
  ('handyman',    'Handyman',     '🔧', 7),
  ('driving',     'Driving',      '🚗', 8),
  ('other',       'Other',        '✨', 9)
on conflict (id) do nothing;

alter table public.categories enable row level security;
create policy "Categories are publicly readable" on public.categories for select using (true);

-- ============================================================
-- 3. SERVICES
-- ============================================================
create table if not exists public.services (
  id             uuid primary key default uuid_generate_v4(),
  provider_id    uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  description    text not null,
  price          numeric(10, 2) not null default 0,
  price_type     text not null default 'hourly'
                   check (price_type in ('hourly', 'fixed', 'negotiable')),
  category       text not null references public.categories(id),
  city           text not null,
  contact_email  text,
  contact_phone  text,
  is_active      boolean not null default true,
  view_count     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists services_provider_id_idx on public.services(provider_id);
create index if not exists services_category_idx    on public.services(category);
create index if not exists services_city_idx        on public.services(city);
create index if not exists services_is_active_idx   on public.services(is_active);
create index if not exists services_created_at_idx  on public.services(created_at desc);
create index if not exists services_fts_idx on public.services
  using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

alter table public.services enable row level security;
create policy "Active services are viewable by everyone" on public.services for select using (is_active = true);
create policy "Providers can see all their own services"  on public.services for select using (auth.uid() = provider_id);
create policy "Authenticated users can create services"   on public.services for insert with check (auth.uid() = provider_id);
create policy "Providers can update their own services"   on public.services for update using (auth.uid() = provider_id);
create policy "Providers can delete their own services"   on public.services for delete using (auth.uid() = provider_id);

-- ============================================================
-- 4. REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  service_id   uuid not null references public.services(id) on delete cascade,
  reviewer_id  uuid not null references auth.users(id) on delete cascade,
  rating       int  not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (service_id, reviewer_id)
);

create index if not exists reviews_service_id_idx  on public.reviews(service_id);
create index if not exists reviews_reviewer_id_idx on public.reviews(reviewer_id);

alter table public.reviews enable row level security;
create policy "Reviews are publicly viewable"          on public.reviews for select using (true);
create policy "Authenticated users can create reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);
create policy "Reviewers can update their own reviews" on public.reviews for update using (auth.uid() = reviewer_id);
create policy "Reviewers can delete their own reviews" on public.reviews for delete using (auth.uid() = reviewer_id);

-- ============================================================
-- 5. TRIGGER: Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, city, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. TRIGGER: Auto-update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ============================================================
-- 7. STORAGE: Avatar bucket
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Avatars are publicly accessible"       on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update their own avatar"      on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their own avatar"      on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- 8. VIEW: services with ratings
-- ============================================================
create or replace view public.services_with_ratings as
select
  s.*,
  p.full_name  as provider_name,
  p.avatar_url as provider_avatar,
  p.city       as provider_city,
  count(r.id)  as review_count,
  coalesce(avg(r.rating), 0) as avg_rating
from public.services s
left join public.profiles p on p.user_id = s.provider_id
left join public.reviews r  on r.service_id = s.id
where s.is_active = true
group by s.id, p.full_name, p.avatar_url, p.city;

-- ============================================================
-- Schema setup complete! Next steps:
-- 1. Authentication → URL Configuration
--    Site URL: https://your-app.vercel.app
--    Redirect URL: https://your-app.vercel.app/auth/callback
-- 2. (Dev only) Disable email confirmations for faster testing
-- ============================================================
