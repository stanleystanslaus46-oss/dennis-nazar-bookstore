create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on schema private from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;

drop policy if exists "admins manage books" on public.books;
drop policy if exists "admins manage settings" on public.store_settings;
drop policy if exists "admins read admin users" on public.admin_users;
drop policy if exists "admins manage admin users" on public.admin_users;
drop policy if exists "admins read orders" on public.orders;
drop policy if exists "admins update orders" on public.orders;
drop policy if exists "admins read order items" on public.order_items;
drop policy if exists "admins read delivery logs" on public.delivery_logs;

drop policy if exists "admins manage payment proofs" on storage.objects;
drop policy if exists "admins manage book pdfs" on storage.objects;
drop policy if exists "admins manage book covers" on storage.objects;

create policy "admins manage books" on public.books for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins manage settings" on public.store_settings for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins read admin users" on public.admin_users for select to authenticated using (private.is_admin() or user_id = auth.uid());
create policy "admins manage admin users" on public.admin_users for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins read orders" on public.orders for select to authenticated using (private.is_admin());
create policy "admins update orders" on public.orders for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins read order items" on public.order_items for select to authenticated using (private.is_admin());
create policy "admins read delivery logs" on public.delivery_logs for select to authenticated using (private.is_admin());

create policy "admins manage payment proofs" on storage.objects for all to authenticated using (bucket_id = 'payment-proofs' and private.is_admin()) with check (bucket_id = 'payment-proofs' and private.is_admin());
create policy "admins manage book pdfs" on storage.objects for all to authenticated using (bucket_id = 'book-pdfs' and private.is_admin()) with check (bucket_id = 'book-pdfs' and private.is_admin());
create policy "admins manage book covers" on storage.objects for all to authenticated using (bucket_id = 'book-covers' and private.is_admin()) with check (bucket_id = 'book-covers' and private.is_admin());
