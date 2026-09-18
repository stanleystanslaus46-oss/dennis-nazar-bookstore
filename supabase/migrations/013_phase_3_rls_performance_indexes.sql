begin;

drop policy if exists "users can read own admin profile" on public.admin_users;
create policy "users can read own admin profile" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "users read own book access" on public.book_access;
create policy "users read own book access" on public.book_access for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "users read own progress" on public.reading_progress;
create policy "users read own progress" on public.reading_progress for select to authenticated using (user_id = (select auth.uid()));

create index if not exists book_access_order_idx on public.book_access(order_id);
create index if not exists order_items_book_idx on public.order_items(book_id);
create index if not exists orders_approved_by_idx on public.orders(approved_by);
create index if not exists orders_confirmed_by_idx on public.orders(confirmed_by);
create index if not exists reading_progress_book_idx on public.reading_progress(book_id);

commit;
