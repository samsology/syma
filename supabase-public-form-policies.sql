-- Run this in the Supabase SQL editor for the project used by this app.
-- These tables are written by public website forms through the Supabase anon key.

alter table public.enrollments enable row level security;
alter table public.consultations enable row level security;
alter table public.contact_messages enable row level security;

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
