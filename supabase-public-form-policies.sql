-- Run this in the Supabase SQL editor for the project used by this app.
-- This script creates the required database tables and sets up Row Level Security (RLS) policies.

-- 1. Create enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  full_name text not null,
  email text not null,
  phone text not null,
  program text not null,
  experience text not null,
  motivation text not null
);

-- 2. Create consultations table
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  full_name text not null,
  email text not null,
  company_name text not null,
  consultation_type text not null,
  message text not null,
  preferred_date text not null
);

-- 3. Create contact_messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.enrollments enable row level security;
alter table public.consultations enable row level security;
alter table public.contact_messages enable row level security;

-- 5. Create RLS Policies to allow public write access (insert submission)
drop policy if exists "Allow public enrollment submissions" on public.enrollments;
create policy "Allow public enrollment submissions"
on public.enrollments
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public consultation submissions" on public.consultations;
create policy "Allow public consultation submissions"
on public.consultations
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public contact submissions" on public.contact_messages;
create policy "Allow public contact submissions"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

