# Dennis Nazar Store — Production Audit / V4

## Frontend flow
- Store → Book Details → Cart → Checkout → payment proof → confirmation
- Track Order is available without exposing payment-sensitive data.
- My Library requires Supabase Auth and entitlement checks.
- Reader loads individual protected pages, not a public PDF URL.

## Responsive coverage
- Desktop: 1001px+
- Tablet: 761–1000px
- Mobile: 431–760px
- Small phones: 361–430px
- Extra-small phones: ≤360px
- Landscape mobile: dedicated rules included.
- Fixed-width/overflow risks were hardened with min-width:0, max-width and overflow rules.

## Backend deployment required
Deploy these Edge Functions to Supabase project `mnxnwstxbunugmrurhkw`:
- create-order
- confirm-payment
- reject-order
- resend-library-access
- ensure-access
- reader-manifest
- reader-page
- track-order

`confirm-order` and `send-delivery` are local legacy stubs that return HTTP 410 and must be redeployed/removed remotely before production.

## Database migrations
Apply migrations 001–006 in order. In particular:
- 005 creates private page-based reader tables/storage.
- 006 creates newsletter_subscribers.

## Important limitation
The protected reader reduces casual file sharing but cannot technically prevent screenshots, screen recording, photography, or manual copying of visible pages.

## Final live checks
1. Configure Supabase Auth redirect URL to the production `library.html` URL.
2. Test a real order from checkout through admin confirmation.
3. Verify a non-owner cannot call reader functions successfully.
4. Verify an owner can resume reading after refresh.
5. Verify rejected orders show no Library access.
6. Verify mobile/desktop menu, cart, modal, checkout, tracking and reader.
7. Confirm no public `book-pdfs` URL is linked by the storefront.

## Phase 4 — Library access management
- Admin dashboard now includes a Library Access tab.
- Admins can search/filter active and revoked entitlements.
- Admins can revoke or restore an individual entitlement.
- Added `007_library_access_admin.sql` for the required admin RLS policy.
- Added `revoke-access` Edge Function; it requires an authenticated admin.

### Live Supabase actions still required
1. Apply migrations `006_newsletter_subscribers.sql` and `007_library_access_admin.sql` if not already applied.
2. Deploy `track-order` and `revoke-access` Edge Functions.
3. Confirm the production site URL in `PUBLIC_SITE_URL` and Supabase Auth redirect URLs.
4. Keep `book-pdfs` private and populate `book-pages` only through the admin workflow.
5. Upload/convert each real PDF into page images before customer reading access is enabled.


## V6 security verification notes
- `ensure-access` grants only missing entitlements and never overwrites an existing `revoked` record.
- `reader-manifest` and `reader-page` require a valid authenticated session and `book_access.status = active`.
- `reader-page` returns only a short-lived signed URL for an individual page from the private `book-pages` bucket.
- The original `book-pdfs` bucket must remain private and must never be exposed to customers.
- After deploying functions, test: grant → read → revoke → reopen Library → reader must remain blocked.


## Price correction
- Official softcopy retail price: **2,500 TZS per available book**.
- Migration `008_correct_softcopy_price.sql` updates the live `books` records when applied.
- `create-order` reads the authoritative price from Supabase, so checkout totals are server-side calculated.


## Production verification pass
- Live Supabase book prices verified at 2,500 TZS for all three available books.
- Legacy confirm-order and send-delivery endpoints disabled remotely (HTTP 410).
- ensure-access deployed as version 2 to preserve revoked access.
- track-order deployed and available.
- Reader progress formula verified as percentage of pages, independent of book price.
