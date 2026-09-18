begin;

create or replace function public.enforce_order_transition()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not ((old.status = 'PENDING_VERIFICATION' and new.status in ('CONFIRMED','REJECTED')) or (old.status = 'CONFIRMED' and new.status = 'DELIVERED')) then
      raise exception 'Invalid order status transition from % to %', old.status, new.status using errcode = 'check_violation';
    end if;
  end if;
  if new.status in ('CONFIRMED','DELIVERED') and new.approved_at is null then
    new.approved_at = coalesce(new.confirmed_at, now());
  end if;
  if new.status in ('CONFIRMED','DELIVERED') and new.approved_by is null then
    new.approved_by = new.confirmed_by;
  end if;
  if new.status = 'REJECTED' and new.rejected_at is null then
    new.rejected_at = now();
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_security_audit_trigger on public.orders;
create trigger orders_security_audit_trigger
before update on public.orders
for each row execute function public.enforce_order_transition();

revoke all on function public.enforce_order_transition() from public;

commit;
