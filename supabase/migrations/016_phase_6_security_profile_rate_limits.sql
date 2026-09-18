begin;

create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  route text not null,
  key_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.security_events enable row level security;
revoke all on public.security_events from anon, authenticated;
create index if not exists security_events_route_created_idx on public.security_events(route, created_at desc);

create table if not exists public.rate_limits (
  bucket_key text primary key,
  route text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_route text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  v_now timestamptz := now();
  v_row public.rate_limits%rowtype;
begin
  if p_limit < 1 or p_window_seconds < 1 then return false; end if;
  insert into public.rate_limits(bucket_key, route, window_started_at, request_count, updated_at)
  values(p_bucket_key, p_route, v_now, 1, v_now)
  on conflict(bucket_key) do update set
    route = excluded.route,
    window_started_at = case
      when public.rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now
      then v_now else public.rate_limits.window_started_at end,
    request_count = case
      when public.rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now
      then 1 else public.rate_limits.request_count + 1 end,
    updated_at = v_now
  returning * into v_row;
  return v_row.request_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

alter table public.delivery_logs
  add column if not exists event_key text,
  add column if not exists attempt integer not null default 1;
create unique index if not exists delivery_logs_event_key_unique
  on public.delivery_logs(order_id, channel, event_key)
  where event_key is not null and event_key <> '';

create index if not exists rate_limits_updated_idx on public.rate_limits(updated_at desc);
create unique index if not exists profiles_email_unique
  on public.profiles(lower(trim(email)))
  where email is not null and trim(email) <> '';

commit;
