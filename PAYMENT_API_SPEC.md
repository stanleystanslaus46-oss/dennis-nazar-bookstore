# Payment API

## Order creation

`create-order` accepts customer details, cart item IDs, transaction ID and/or payment screenshot. Prices are read server-side from the `books` table.

## Status flow

`PENDING_VERIFICATION` -> `CONFIRMED` / `DELIVERED`

`PENDING_VERIFICATION` -> `REJECTED`

`CONFIRMED` and `DELIVERED` orders can receive private Library access.

## Customer delivery

There is no public PDF release step.

After confirmation:
- `confirm-payment` sends a branded Library email when Resend is configured.
- optional WhatsApp notification can be sent.
- `ensure-access` grants missing active entitlements.
- the reader exposes protected individual pages only.

Rejected/unverified orders never receive Library access.
