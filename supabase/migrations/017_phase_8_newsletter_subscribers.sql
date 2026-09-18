begin;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "public can subscribe to newsletter"
on public.newsletter_subscribers
for insert to anon, authenticated
with check (char_length(email) between 5 and 254);

drop policy if exists "admins can read newsletter subscribers" on public.newsletter_subscribers;
create policy "admins can read newsletter subscribers"
on public.newsletter_subscribers
for select to authenticated
using (private.is_admin());

revoke all on public.newsletter_subscribers from anon, authenticated;
grant insert, select on public.newsletter_subscribers to authenticated;
grant insert on public.newsletter_subscribers to anon;

commit;

