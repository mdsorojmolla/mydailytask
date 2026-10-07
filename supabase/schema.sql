create extension if not exists pgcrypto;

do $$
begin
  create type public.task_priority as enum ('HIGH', 'MEDIUM', 'LOW');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_scope as enum ('DAILY', 'WEEKLY');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.activity_status as enum ('NOT_STARTED', 'COMPLETED', 'SKIPPED');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  setup_completed boolean not null default false,
  browser_notifications_enabled boolean not null default false,
  reminder_before_minutes integer not null default 15 check (reminder_before_minutes between 0 and 120),
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  term text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists routines_one_active_per_user
on public.routines(user_id)
where active;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  routine_id uuid references public.routines(id) on delete cascade,
  course_name text not null,
  teacher text,
  room text,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  enabled boolean not null default true,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_time_order check (end_time > start_time)
);

create index if not exists classes_user_day_idx on public.classes(user_id, day_of_week, start_time);

create table if not exists public.class_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  date date not null,
  status text not null default 'CANCELLED' check (status = 'CANCELLED'),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, class_id, date)
);

create index if not exists class_exceptions_user_date_idx on public.class_exceptions(user_id, date);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'Personal',
  start_time time not null,
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  repeat_rule text not null default 'DAILY',
  enabled boolean not null default true,
  tracking_enabled boolean not null default true,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_user_enabled_idx on public.activities(user_id, enabled, start_time);

create table if not exists public.activity_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  date date not null,
  status public.activity_status not null default 'NOT_STARTED',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_id, date)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  scope public.task_scope not null default 'DAILY',
  date date,
  week_start date,
  start_time time,
  end_time time,
  priority public.task_priority not null default 'MEDIUM',
  status public.task_status not null default 'NOT_STARTED',
  category text,
  reminder_enabled boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_scope_date check (
    (scope = 'DAILY' and date is not null) or
    (scope = 'WEEKLY' and week_start is not null)
  ),
  constraint tasks_time_order check (end_time is null or start_time is null or end_time > start_time)
);

create index if not exists tasks_user_date_idx on public.tasks(user_id, date, start_time);
create index if not exists tasks_user_week_idx on public.tasks(user_id, week_start, priority);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);

create table if not exists public.task_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  action text not null,
  from_status public.task_status,
  to_status public.task_status,
  from_date date,
  to_date date,
  created_at timestamptz not null default now()
);

create index if not exists task_history_user_task_idx on public.task_history(user_id, task_id, created_at desc);

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  date date not null,
  description text,
  repeat_rule text not null default 'NONE' check (repeat_rule in ('NONE', 'YEARLY')),
  affects_classes boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists holidays_user_date_idx on public.holidays(user_id, date);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('TASK', 'CLASS', 'ACTIVITY')),
  item_id uuid not null,
  scheduled_for timestamptz not null,
  delivery_type text not null default 'BROWSER',
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'CANCELLED', 'FAILED')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  status text not null default 'REVIEW_REQUIRED',
  extracted_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists routine_uploads_user_idx on public.routine_uploads(user_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

drop trigger if exists routines_set_updated_at on public.routines;
create trigger routines_set_updated_at
before update on public.routines
for each row execute function public.set_updated_at();

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

drop trigger if exists activity_history_set_updated_at on public.activity_history;
create trigger activity_history_set_updated_at
before update on public.activity_history
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists holidays_set_updated_at on public.holidays;
create trigger holidays_set_updated_at
before update on public.holidays
for each row execute function public.set_updated_at();

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

drop trigger if exists routine_uploads_set_updated_at on public.routine_uploads;
create trigger routine_uploads_set_updated_at
before update on public.routine_uploads
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.routines enable row level security;
alter table public.classes enable row level security;
alter table public.class_exceptions enable row level security;
alter table public.activities enable row level security;
alter table public.activity_history enable row level security;
alter table public.tasks enable row level security;
alter table public.task_history enable row level security;
alter table public.holidays enable row level security;
alter table public.notifications enable row level security;
alter table public.routine_uploads enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "settings_select_own" on public.settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "routines_all_own" on public.routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "classes_all_own" on public.classes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "class_exceptions_all_own" on public.class_exceptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities_all_own" on public.activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity_history_all_own" on public.activity_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_all_own" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "task_history_all_own" on public.task_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "holidays_all_own" on public.holidays for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_all_own" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routine_uploads_all_own" on public.routine_uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('routine-uploads', 'routine-uploads', false)
on conflict (id) do nothing;

create policy "routine_uploads_storage_select_own"
on storage.objects for select
using (
  bucket_id = 'routine-uploads' and
  split_part(name, '/', 1) = auth.uid()::text
);

create policy "routine_uploads_storage_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'routine-uploads' and
  split_part(name, '/', 1) = auth.uid()::text
);

create policy "routine_uploads_storage_delete_own"
on storage.objects for delete
using (
  bucket_id = 'routine-uploads' and
  split_part(name, '/', 1) = auth.uid()::text
);
