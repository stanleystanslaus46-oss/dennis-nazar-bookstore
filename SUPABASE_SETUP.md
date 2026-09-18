# Supabase Setup

## Architecture

- Supabase Auth for secure Library sign-in
- Private database tables with RLS
- Private `book-pages` storage bucket for reader page images
- `reader-manifest` and `reader-page` Edge Functions
- `confirm-payment` grants access and notifies the customer
- `resend-library-access` sends a branded Library reminder
- `reject-order` can notify the customer when verification fails
- Optional Resend SMTP / Edge Function email delivery
- Optional WhatsApp Business Cloud notifications

## Book content

The customer-facing system does not distribute the original PDF. When the real books are supplied, use:

`PDF -> optimized page images -> private book-pages bucket -> book_pages rows -> protected reader`

Keep source PDFs private for admin/archive use. Never place a public PDF URL in storefront pages.

## Production environment

Set:
- `PUBLIC_SITE_URL` to the real website origin
- `RESEND_API_KEY` and `RESEND_FROM` after domain verification
- WhatsApp secrets only if WhatsApp automation is enabled

Do not expose service-role/secret keys in browser JavaScript.
