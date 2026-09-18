-- 008_correct_softcopy_price.sql
-- Official retail price correction: each currently available softcopy is 2,500 TZS.
update public.books
set price = 2500
where id in ('book1','book2','book3')
  and available = true;

-- Keep this migration idempotent and safe to re-run.
