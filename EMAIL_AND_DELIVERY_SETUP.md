# Customer Email & Library Access

The Dennis Nazar store uses a private digital Library. Customers do **not** receive the original PDF as a public download.

## Customer email types

1. **Magic Link / Library sign-in** — Supabase Auth sends the secure one-time sign-in email. The branded HTML template is `supabase/templates/magic_link.html`.
2. **Payment confirmed** — `confirm-payment` sends a branded email directing the customer to `library.html`.
3. **Library access reminder** — `resend-library-access` sends the same branded Library message when an admin resends access.
4. **Payment verification update** — `reject-order` can send a branded message explaining why payment could not be verified.

## Email provider

During development, Supabase's built-in mail service can be used. It is rate-limited.

For production, configure a custom SMTP provider such as Resend after a sending domain is purchased and verified. Do not put SMTP credentials or API keys in frontend files.

## Required Edge Function secrets for Resend

- `RESEND_API_KEY`
- `RESEND_FROM`
- `PUBLIC_SITE_URL`

Example `RESEND_FROM`: `Dennis Nazar <library@your-verified-domain.com>`.

## Library delivery model

After payment confirmation, the customer is granted private Library access. The reader serves individual protected page images using short-lived signed URLs. The original PDF is never exposed as a customer download link.

## WhatsApp

Optional WhatsApp notifications use:
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_VERSION`

WhatsApp is supplementary; Library access remains the source of truth.
