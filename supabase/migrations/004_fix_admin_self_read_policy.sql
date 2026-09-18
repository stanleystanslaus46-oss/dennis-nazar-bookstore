-- Allow an authenticated admin account to read its own admin profile.
-- This is required by the localhost admin login guard.
drop policy if exists "admins read admin users" on public.admin_users;
create policy "admins read admin users" on public.admin_users
for select to authenticated
using (private.is_admin());

drop policy if exists "users can read own admin profile" on public.admin_users;
create policy "users can read own admin profile" on public.admin_users
for select to authenticated
using (user_id = auth.uid());
