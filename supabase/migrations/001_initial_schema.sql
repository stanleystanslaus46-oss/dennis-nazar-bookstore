create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  price integer not null default 0 check (price >= 0),
  image_path text not null default '',
  pdf_path text not null default '',
  available boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  whatsapp_number text not null,
  amount integer not null check (amount > 0),
  currency text not null default 'TZS',
  status text not null default 'PENDING_VERIFICATION' check (status in ('PENDING_VERIFICATION','CONFIRMED','REJECTED','DELIVERED')),
  transaction_id text,
  payment_screenshot_path text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id)
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id text not null references public.books(id),
  title_snapshot text not null,
  price integer not null,
  quantity integer not null default 1 check (quantity = 1)
);

create table if not exists public.delivery_logs (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  channel text not null check (channel in ('email','whatsapp')),
  status text not null,
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists orders_email_idx on public.orders(customer_email);
create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.is_admin()
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

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.store_settings enable row level security;
alter table public.books enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_logs enable row level security;

-- Public visitors may read the storefront catalog/settings.
create policy "public can read books" on public.books for select to anon, authenticated using (true);
create policy "public can read settings" on public.store_settings for select to anon, authenticated using (true);

-- Only admins may manage catalog/settings.
create policy "admins manage books" on public.books for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage settings" on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read admin users" on public.admin_users for select to authenticated using (public.is_admin() or user_id = auth.uid());
create policy "admins manage admin users" on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read orders" on public.orders for select to authenticated using (public.is_admin());
create policy "admins update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read order items" on public.order_items for select to authenticated using (public.is_admin());
create policy "admins read delivery logs" on public.delivery_logs for select to authenticated using (public.is_admin());

-- Private storage buckets. Files are never public.
insert into storage.buckets (id, name, public) values ('payment-proofs','payment-proofs',false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('book-pdfs','book-pdfs',false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('book-covers','book-covers',true) on conflict (id) do nothing;

create policy "admins manage payment proofs" on storage.objects for all to authenticated
using (bucket_id = 'payment-proofs' and public.is_admin())
with check (bucket_id = 'payment-proofs' and public.is_admin());

create policy "admins manage book pdfs" on storage.objects for all to authenticated
using (bucket_id = 'book-pdfs' and public.is_admin())
with check (bucket_id = 'book-pdfs' and public.is_admin());

create policy "public read book covers" on storage.objects for select to anon, authenticated
using (bucket_id = 'book-covers');

create policy "admins manage book covers" on storage.objects for all to authenticated
using (bucket_id = 'book-covers' and public.is_admin())
with check (bucket_id = 'book-covers' and public.is_admin());

insert into public.store_settings (id, data) values (1, jsonb_build_object(
  'author','Dennis Nazar',
  'currency','TZS',
  'email','dennisnazar123@gmail.com',
  'paymentPhone','+255765889395',
  'whatsapp','+255765889395',
  'mapLocation','66MH+QCF Dar es Salaam, Tanzania',
  'socialUsername','@dennisnazar_',
  'colors',jsonb_build_object('navy','#211d5a','navy2','#181443','orange','#f47721','orange2','#ff8a2d'),
  'content',jsonb_build_object(
    'heroTitle','Books that <span>shape</span><br>how you <span>think.</span>',
    'heroLead','Vitabu vinavyogusa maisha, mahusiano, kusudi, maamuzi na ukuaji binafsi — vikiwa vimeandikwa kwa mtazamo wa maisha halisi.',
    'booksCopy','Chagua kitabu, kamilisha malipo na upokee softcopy yako kwa hatua rahisi.',
    'whyTitle','More than a <span>book.</span>',
    'whyLead','Maandishi yanayokusukuma kufikiri, kutafakari na kuchukua hatua.',
    'comingTitle','More Books Are <span>Coming.</span>',
    'comingCopy','Vitabu viwili vipya bado vinaandaliwa. Fuata updates ili uwe wa kwanza kujua vinapotoka.',
    'aboutTitle','Dennis <span>Nazar.</span>',
    'aboutBody','Dennis Nazar ni mwandishi wa vitabu, mwalimu wa Biblia, mkufunzi mwelekezi (mentor) na mshauri katika masuala ya uongozi, afya, ndoa na familia.\n\nAmetoa mchango mkubwa katika kujenga kizazi cha vijana wanaoelewa kusudi lao, ukuaji binafsi na nguvu ya kutembea katika maono ya Mungu kupitia programu ya ELEVATED LIFE SERIES.\n\nAkiwa na stashahada ya juu ya ufamasia kutoka NOCOHAS pamoja na shahada ya Theology kutoka AUCA, Kigali-Rwanda, ameunganisha maarifa ya afya ya mwili, afya ya akili na mafundisho ya kiroho.\n\nAnaamini kila kijana amewekewa ndani yake maono, ndoto na wito unaokusudiwa kuibua thamani yake duniani — na kupitia maandishi na mafundisho yake, anahamasisha watu kuishi maisha ya kusudi, kanuni na uongozi wenye maadili.',
    'purchaseTitle','Get notified about<br><span>your next book.</span>',
    'purchaseCopy','Weka email yako ili upokee taarifa kuhusu releases mpya, order updates na softcopy delivery.',
    'footerTagline','Books that inspire thought, reflection & better living.'
  )
)) on conflict (id) do nothing;

insert into public.books (id,title,subtitle,price,image_path,pdf_path,available,sort_order) values
('book1','HATUA 10 ZA KUCHAGUA MWENZI SAHIHI WA MAISHA','Siri za Kuamua Vyema Leo, ili Uepuke Maumivu ya Baadae',2500,'assets/book-1.webp','',true,1),
('book2','MAAJABU YA MWANAMKE','Kitabu cha kutafakari thamani, nafasi na safari ya mwanamke.',2500,'assets/book-2.webp','',true,2),
('book3','HISTORIA YAKO ITASOMEKAJE?','Jiulize jinsi historia yako itaandikwa na kusomeka katika maisha ya watu wanaokuzunguka.',2500,'assets/book-3.webp','',true,3),
('book4','Kitabu kipya kinakuja','NEW RELEASE',0,'assets/coming-soon-cover.jpg','',false,4),
('book5','Hadithi nyingine inakuja','NEW RELEASE',0,'assets/coming-soon-cover-04.jpg','',false,5)
on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, price=excluded.price, image_path=excluded.image_path, available=excluded.available, sort_order=excluded.sort_order;
