# Dennis Nazar Premium Store — V13 Deployment-Ready Package

## Production architecture
Payment → Admin verification → Private Library access → Protected page reader

The original PDF is never exposed as a customer download. Reader pages are served through protected Edge Functions with short-lived access URLs.

## 1. Supabase Edge Functions
Deploy these V13 functions from `supabase/functions/`:

- `confirm-payment` — admin-only payment confirmation + branded email/WhatsApp notification
- `resend-library-access` — admin-only resend of private Library access
- `reject-order` — admin-only rejection + branded payment-update email

Each function imports the shared `supabase/functions/_shared.ts`. When deploying manually, upload `index.ts`, `_shared.ts`, and `deno.json` together.

## 2. Required Supabase secrets
Set these in Supabase Edge Function Secrets. **Never put them in frontend JavaScript.**

Required for transactional email:
- `RESEND_API_KEY`
- `RESEND_FROM` (must be a sender allowed by your Resend account/domain)

Required for correct production links:
- `PUBLIC_SITE_URL` — your actual deployed website origin, for example `https://your-site.example`

Optional WhatsApp Cloud API:
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_VERSION` (defaults to `v23.0`)

The V13 transactional functions intentionally fail rather than invent a fallback production domain when `PUBLIC_SITE_URL` is missing.

## 3. Supabase Auth Magic Link
The file `supabase/templates/magic_link.html` is the branded authentication email. For a hosted Supabase project, paste its complete contents into Authentication → Email Templates → Magic Link.

Set subject to:
`Dennis Nazar Private Library — Your secure access link`

The template uses `{{ .ConfirmationURL }}` and expects the deployed website to serve `/assets/dn-logo-white.png`.

## 4. Deployment order
1. Apply all SQL migrations in `supabase/migrations/` in order.
2. Confirm the production website URL.
3. Set Edge Function secrets.
4. Deploy `confirm-payment`, `resend-library-access`, and `reject-order`.
5. Paste the branded Magic Link template into Supabase Auth.
6. Configure sender/SMTP when you have a verified sending domain.
7. Upload/ingest the real book PDFs into private page images before selling access.
8. Run one controlled end-to-end test order.

## 5. Do not expose these
- Supabase service-role/secret key
- Resend API key
- WhatsApp access token
- Original PDFs in public storage

Only the Supabase publishable key belongs in frontend configuration.

## 6. Current catalog
All three available books are priced at **TZS 2,500**. The server calculates order totals from the `books` table; browser-supplied prices are not trusted.

## 7. Before launch
- Set a real `PUBLIC_SITE_URL`.
- Configure a verified email sender/domain.
- Enable Supabase leaked-password protection.
- Review RLS/security advisor findings and add missing FK indexes where appropriate.
- Add production rate limiting/abuse controls for public order creation and tracking.
- Add real `book_pages` records generated from the actual PDFs.
- Review legal pages and refund wording.
- Perform a real payment verification test without exposing any private source PDF.
