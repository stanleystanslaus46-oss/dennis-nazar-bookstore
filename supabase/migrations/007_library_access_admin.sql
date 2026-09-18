-- Admin management for customer library entitlements.
alter table public.book_access enable row level security;
drop policy if exists "admins manage book access" on public.book_access;
create policy "admins manage book access"
on public.book_access
for all to authenticated
using (private.is_admin())
with check (private.is_admin());
