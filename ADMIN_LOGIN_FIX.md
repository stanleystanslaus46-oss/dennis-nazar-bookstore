# Admin Login Fix

This version is connected to the Dennis Nazar Supabase project and includes the admin self-read RLS policy required by the localhost admin login guard.

Admin account:
- Email: dennisnazar123@gmail.com
- Role: admin

The frontend admin guard now verifies `user_id`, `email`, and `role = admin` before opening the dashboard.

Supabase migration included:
- `004_fix_admin_self_read_policy.sql`

Never place a Supabase service-role key in the frontend.
