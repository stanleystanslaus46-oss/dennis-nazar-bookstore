begin;

create or replace function public.protect_profile_email()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is not null and new.email is distinct from old.email then
    raise exception 'Profile email changes must be performed through the authenticated email-change flow' using errcode = 'insufficient_privilege';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_email_protection_trigger on public.profiles;
create trigger profiles_email_protection_trigger
before update on public.profiles
for each row execute function public.protect_profile_email();

revoke all on function public.protect_profile_email() from public;

commit;
