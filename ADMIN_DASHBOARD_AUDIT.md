# Dennis Nazar Admin Dashboard Audit — V16

## What the admin can manage
- Secure Supabase Auth login with `public.admin_users` role check.
- Orders: search/filter, view payment proof, confirm payment and grant access, reject payment, resend Library notification.
- General store settings: author, email, payment/mobile number, WhatsApp, map location, social username.
- Brand colors: navy, dark navy, orange, orange 2.
- Website copy: hero, books section, Why Read, Coming Soon, About, Purchase Update, footer tagline.
- Catalog: edit existing books, change title/subtitle/price/cover/availability/order, upload cover images, and add new books dynamically.
- Library Access: inspect active/revoked access and revoke/restore customer entitlements.
- Reader Content: upload multiple private page images for any catalog book, with controlled page numbering and safe upsert of page metadata.

## What still requires code/deployment work
The dashboard intentionally does not edit arbitrary HTML/CSS layout, section structure, navigation labels, logos/author portrait, legal-page wording, or payment-flow logic. Those are code/assets and should not be exposed as unrestricted CMS fields.

## Adding a new book
1. Admin → Books → Add New Book.
2. Enter title, subtitle, price, cover, sort order.
3. Leave Available = No while preparing it.
4. Admin → Reader Content → select page images and upload them.
5. Verify the page count.
6. Admin → Books → set Available = Yes and save.
7. The storefront automatically loads the new catalog item from Supabase; no new HTML card is required.

## Security note
Book page metadata is admin-only and page images remain in the private `book-pages` bucket. Customers receive short-lived signed page URLs only through the protected reader flow.
