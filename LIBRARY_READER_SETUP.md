# Dennis Nazar — Private Digital Library

The storefront now supports a protected reading architecture. Customers are granted access to books after a payment is confirmed, then read page-by-page inside `library.html` / `reader.html`.

## Current flow

1. Customer purchases a book using the existing checkout.
2. Admin verifies the payment.
3. The order becomes `CONFIRMED` or `DELIVERED`.
4. Customer opens **My Library** and signs in with the same email used at checkout.
5. `ensure-access` matches confirmed orders to the authenticated email and creates `book_access` records.
6. The reader checks entitlement before returning any page.
7. Page images are stored in the private `book-pages` bucket and exposed only through short-lived signed URLs.
8. Reading progress is saved in `reading_progress`.

## Important security model

- Original PDFs remain in the private `book-pdfs` bucket.
- The normal customer delivery flow no longer sends the public download URL.
- The reader does not expose `book_pages.image_path` directly to the browser.
- The `reader-page` function verifies the authenticated user + book entitlement before creating a 5-minute signed URL.
- Page images should be generated from the source PDFs when the owner supplies them.
- The reader includes a visible personalized watermark using the authenticated customer's email.

## Supabase objects added

Tables:

- `book_access`
- `reading_progress`
- `book_pages`

Private storage bucket:

- `book-pages`

Edge Functions:

- `ensure-access`
- `reader-manifest`
- `reader-page`
- `confirm-payment` (new admin payment-confirmation flow)
- `resend-library-access` (new admin resend flow)

## Auth redirect

Before production use, add the production URL and the library URL to Supabase Authentication URL configuration, for example:

`https://YOUR-DOMAIN/library.html`

For local development, add the local origin you use for testing.

## When PDFs are supplied

Do not make the PDFs public. The intended ingestion pipeline is:

`PDF -> page images -> book-pages storage -> book_pages rows -> protected reader`

The source PDF can remain in `book-pdfs` for archival/admin use, while the customer-facing reader uses page images.
