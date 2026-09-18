-- Digital library: customers receive reading access, not the original PDF.
create table if not exists public.book_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'active' check (status in ('active','revoked')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  current_page integer not null default 1 check (current_page >= 1),
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  last_read_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.book_pages (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references public.books(id) on delete cascade,
  page_number integer not null check (page_number >= 1),
  image_path text not null,
  created_at timestamptz not null default now(),
  unique (book_id, page_number)
);

create index if not exists book_access_user_idx on public.book_access(user_id, status);
create index if not exists book_access_book_idx on public.book_access(book_id, status);
create index if not exists reading_progress_user_idx on public.reading_progress(user_id, updated_at desc);
create index if not exists book_pages_book_idx on public.book_pages(book_id, page_number);

alter table public.book_access enable row level security;
alter table public.reading_progress enable row level security;
alter table public.book_pages enable row level security;

-- Customers can only see their own entitlements.
drop policy if exists "users read own book access" on public.book_access;
create policy "users read own book access" on public.book_access
for select to authenticated
using (user_id = auth.uid());

-- Customers can only read/write their own reading progress.
drop policy if exists "users read own progress" on public.reading_progress;
create policy "users read own progress" on public.reading_progress
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "users insert own progress" on public.reading_progress;
create policy "users insert own progress" on public.reading_progress
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "users update own progress" on public.reading_progress;
create policy "users update own progress" on public.reading_progress
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Page metadata is intentionally not directly readable by customers.
drop policy if exists "admins manage book pages" on public.book_pages;
create policy "admins manage book pages" on public.book_pages
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

-- Private page-image storage. Customers receive short-lived signed URLs only
-- after the reader Edge Function verifies book access.
insert into storage.buckets (id, name, public)
values ('book-pages','book-pages',false)
on conflict (id) do nothing;

drop policy if exists "admins manage book pages storage" on storage.objects;
create policy "admins manage book pages storage" on storage.objects
for all to authenticated
using (bucket_id = 'book-pages' and private.is_admin())
with check (bucket_id = 'book-pages' and private.is_admin());

-- Keep original PDFs private; the reader does not expose book-pdfs.
