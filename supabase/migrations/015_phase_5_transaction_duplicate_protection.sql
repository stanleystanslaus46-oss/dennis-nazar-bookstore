begin;

create unique index if not exists orders_transaction_id_unique
on public.orders(transaction_id)
where transaction_id is not null and transaction_id <> '';

commit;
