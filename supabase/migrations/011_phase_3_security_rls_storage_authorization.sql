begin;

-- Profiles are private and tied to the authenticated user.
alter table public.profiles enable row level security;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Customers may only read their own future profile-linked orders. They cannot insert or update orders directly.
drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders for select to authenticated using (customer_id = (select auth.uid()));

-- Only admins can manage entitlements. Customers can read their own active/revoked access records.
drop policy if exists "admins manage book access" on public.book_access;
create policy "admins manage book access" on public.book_access for all to authenticated using (private.is_admin()) with check (private.is_admin());

-- Reading progress is only valid for books to which the user currently has active access.
drop policy if exists "users insert own progress" on public.reading_progress;
create policy "users insert own progress" on public.reading_progress for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.book_access ba where ba.user_id = (select auth.uid()) and ba.book_id = reading_progress.book_id and ba.status = 'active'));
drop policy if exists "users update own progress" on public.reading_progress;
create policy "users update own progress" on public.reading_progress for update to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.book_access ba where ba.user_id = (select auth.uid()) and ba.book_id = reading_progress.book_id and ba.status = 'active')) with check (user_id = (select auth.uid()) and exists (select 1 from public.book_access ba where ba.user_id = (select auth.uid()) and ba.book_id = reading_progress.book_id and ba.status = 'active'));

-- Keep sensitive PDF paths out of browser-readable book rows. Server-side service-role code can still read them.
revoke select on public.books from anon, authenticated;
grant select (id, title, subtitle, price, image_path, available, sort_order, updated_at, slug, description, author, currency, status, created_at) on public.books to anon, authenticated;

-- Restrict upload types and sizes at the bucket level. All private buckets remain private.
update storage.buckets set file_size_limit = 8388608, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'payment-proofs';
update storage.buckets set file_size_limit = 52428800, allowed_mime_types = array['application/pdf'] where id = 'book-pdfs';
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'book-pages';
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'book-covers';

commit;
