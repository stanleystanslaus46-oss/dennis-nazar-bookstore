begin;

-- Customer profile layer linked to Supabase Auth. Credentials remain exclusively in auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Extend the existing books table instead of replacing it.
alter table public.books add column if not exists slug text;
alter table public.books add column if not exists description text not null default '';
alter table public.books add column if not exists author text not null default 'Dennis Nazar';
alter table public.books add column if not exists currency text not null default 'TZS';
alter table public.books add column if not exists status text not null default 'coming_soon';
alter table public.books add column if not exists created_at timestamptz not null default now();

update public.books
set slug = lower(regexp_replace(trim(coalesce(title, id)), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';

update public.books
set description = subtitle
where coalesce(description, '') = '' and coalesce(subtitle, '') <> '';

update public.books
set status = case when available then 'available' else 'coming_soon' end;

update public.books
set currency = 'TZS'
where currency is null or currency = '';

create unique index if not exists books_slug_key on public.books(slug);
create index if not exists books_status_idx on public.books(status);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'books_status_check') then
    alter table public.books add constraint books_status_check check (status in ('available','coming_soon','inactive'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'books_currency_check') then
    alter table public.books add constraint books_currency_check check (currency in ('TZS'));
  end if;
end $$;

-- Extend orders with profile linkage and explicit approval/rejection audit timestamps.
alter table public.orders add column if not exists customer_id uuid references public.profiles(id) on delete set null;
alter table public.orders add column if not exists updated_at timestamptz not null default now();
alter table public.orders add column if not exists approved_at timestamptz;
alter table public.orders add column if not exists approved_by uuid references auth.users(id);
alter table public.orders add column if not exists rejected_at timestamptz;

update public.orders set updated_at = created_at where updated_at is null;
update public.orders set approved_at = confirmed_at, approved_by = confirmed_by where status in ('CONFIRMED','DELIVERED') and approved_at is null;

create index if not exists orders_customer_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_transaction_idx on public.orders(transaction_id) where transaction_id is not null;

-- Extend delivery records with recipient and sent-time fields without changing existing statuses.
alter table public.delivery_logs add column if not exists recipient_email text;
alter table public.delivery_logs add column if not exists sent_at timestamptz;
alter table public.delivery_logs add column if not exists updated_at timestamptz not null default now();

update public.delivery_logs dl
set recipient_email = o.customer_email
from public.orders o
where dl.order_id = o.id and dl.recipient_email is null and dl.channel = 'email';

update public.delivery_logs set sent_at = created_at where sent_at is null and status = 'sent';

create index if not exists delivery_logs_order_channel_idx on public.delivery_logs(order_id, channel, created_at desc);

commit;
