-- Migration: University Routine System with Admin Upload, Batches, and Class Sync
-- Admin email: mdsorojmolla20@gmail.com

-- 1. Routine Versions table
create table if not exists public.routine_versions (
  id uuid primary key default gen_random_uuid(),
  version_name text not null,
  source_file text,
  file_name text,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  uploaded_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routine_versions_status_idx on public.routine_versions(status);
create index if not exists routine_versions_published_idx on public.routine_versions(published_at desc) where status = 'PUBLISHED';

-- 2. Routine Batches table
create table if not exists public.routine_batches (
  id uuid primary key default gen_random_uuid(),
  routine_version_id uuid not null references public.routine_versions(id) on delete cascade,
  batch_code text not null,
  created_at timestamptz not null default now(),
  unique (routine_version_id, batch_code)
);

create index if not exists routine_batches_version_idx on public.routine_batches(routine_version_id);
create index if not exists routine_batches_code_idx on public.routine_batches(batch_code);

-- 3. Routine Classes table
create table if not exists public.routine_classes (
  id uuid primary key default gen_random_uuid(),
  routine_version_id uuid not null references public.routine_versions(id) on delete cascade,
  batch_code text not null,
  lab_group text,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  course_code text not null,
  teacher text,
  room text,
  class_type text default 'Theory',
  room_type text,
  created_at timestamptz not null default now()
);

create index if not exists routine_classes_version_batch_idx on public.routine_classes(routine_version_id, batch_code);
create index if not exists routine_classes_day_time_idx on public.routine_classes(batch_code, day_of_week, start_time);

-- 4. Add columns to settings & profiles for batch tracking
alter table public.settings add column if not exists selected_batch text;
alter table public.settings add column if not exists synced_routine_version_id uuid references public.routine_versions(id) on delete set null;

alter table public.profiles add column if not exists selected_batch text;

-- 5. Add columns to classes to distinguish university routine items
alter table public.classes add column if not exists is_university boolean not null default false;
alter table public.classes add column if not exists batch_code text;
alter table public.classes add column if not exists lab_group text;

-- 6. Trigger for updated_at on routine_versions
drop trigger if exists routine_versions_set_updated_at on public.routine_versions;
create trigger routine_versions_set_updated_at
before update on public.routine_versions
for each row execute function public.set_updated_at();

-- 7. Enable RLS
alter table public.routine_versions enable row level security;
alter table public.routine_batches enable row level security;
alter table public.routine_classes enable row level security;

-- Policies for routine_versions
create policy "routine_versions_select_published"
on public.routine_versions for select
using (status = 'PUBLISHED' or auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com');

create policy "routine_versions_admin_all"
on public.routine_versions for all
using (auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com')
with check (auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com');

-- Policies for routine_batches
create policy "routine_batches_select"
on public.routine_batches for select
using (
  routine_version_id in (select id from public.routine_versions where status = 'PUBLISHED')
  or auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com'
);

create policy "routine_batches_admin_all"
on public.routine_batches for all
using (auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com')
with check (auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com');

-- Policies for routine_classes
create policy "routine_classes_select"
on public.routine_classes for select
using (
  routine_version_id in (select id from public.routine_versions where status = 'PUBLISHED')
  or auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com'
);

create policy "routine_classes_admin_all"
on public.routine_classes for all
using (auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com')
with check (auth.jwt()->>'email' = 'mdsorojmolla20@gmail.com');
