-- aihearX Supabase şeması (tek üyelik, ağ, lig, yapımcı başvuruları)
-- Çalıştır: supabase db push  veya SQL editöründen.

create extension if not exists "pgcrypto";

-- Profiller: auth.users ile 1-1. Tek üyelik; alt uygulamalarda ayrı hesap yok.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  handle text unique not null,
  role text not null check (role in ('odyolog','odyometrist','kbb','ogrenci','hasta','denge','aile','diger')),
  title text, university text, city text, bio text,
  verified boolean not null default false,
  code text unique not null,                -- odyolog/davet kodu: AYSE-34
  directory_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

-- İlerleme (lig ve rozetler için sunucu kopyası)
create table if not exists public.progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp int not null default 0,
  level int not null default 1,
  streak int not null default 0,
  last_active_day date,
  updated_at timestamptz not null default now()
);

-- Mini uygulama sonuçları (lig tabloları buradan türetilir)
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id text not null,
  score numeric, points numeric, label text,
  meta jsonb,
  day date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists results_app_day on public.results(app_id, day);
create index if not exists results_user on public.results(user_id, created_at desc);

-- Ağ
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('gonderi','vaka','soru','ilan','etkinlik','basari')),
  text text not null,
  tags text[] not null default '{}',
  case_data jsonb, poll jsonb,
  created_at timestamptz not null default now()
);
create index if not exists posts_created on public.posts(created_at desc);

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  followee_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);
create table if not exists public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid references public.profiles(id) on delete set null,
  title text not null, org text not null, city text, type text not null,
  salary_hint text, description text, tags text[] not null default '{}', url text,
  created_at timestamptz not null default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid references public.profiles(id) on delete set null,
  title text not null, org text, date timestamptz not null, city text, online boolean default false,
  kind text not null, url text, description text,
  created_at timestamptz not null default now()
);

-- Yapımcı Ol başvuruları
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null, title text not null, problem text not null, solution text not null,
  audience text, category text,
  status text not null default 'inceleniyor' check (status in ('inceleniyor','kabul','red','yayinda')),
  created_at timestamptz not null default now()
);

-- Haftalık lig görünümleri
create or replace view public.weekly_user_points as
select user_id, date_trunc('week', created_at)::date as week, sum(coalesce(points, score, 0)) as points, count(*) as plays
from public.results group by user_id, week;

create or replace view public.weekly_university_points as
select p.university, w.week, sum(w.points) as points, count(distinct w.user_id) as players
from public.weekly_user_points w join public.profiles p on p.id = w.user_id
where p.university is not null group by p.university, w.week;

-- Satır düzeyi güvenlik
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.results enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.jobs enable row level security;
alter table public.events enable row level security;
alter table public.ideas enable row level security;

create policy "profiles okunur" on public.profiles for select using (true);
create policy "profil sahibi yazar" on public.profiles for insert with check (auth.uid() = id);
create policy "profil sahibi günceller" on public.profiles for update using (auth.uid() = id);

create policy "progress sahibi" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "results sahibi yazar" on public.results for insert with check (auth.uid() = user_id);
create policy "results okunur" on public.results for select using (true);

create policy "posts okunur" on public.posts for select using (true);
create policy "posts yazar" on public.posts for insert with check (auth.uid() = author_id);
create policy "posts sahibi siler" on public.posts for delete using (auth.uid() = author_id);
create policy "follows okunur" on public.follows for select using (true);
create policy "follows sahibi" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "likes okunur" on public.likes for select using (true);
create policy "likes sahibi" on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comments okunur" on public.comments for select using (true);
create policy "comments yazar" on public.comments for insert with check (auth.uid() = author_id);
create policy "jobs okunur" on public.jobs for select using (true);
create policy "jobs yazar" on public.jobs for insert with check (auth.uid() = poster_id);
create policy "events okunur" on public.events for select using (true);
create policy "events yazar" on public.events for insert with check (auth.uid() = poster_id);
create policy "ideas yazar" on public.ideas for insert with check (auth.uid() = user_id or user_id is null);
create policy "ideas sahibi okur" on public.ideas for select using (auth.uid() = user_id);
