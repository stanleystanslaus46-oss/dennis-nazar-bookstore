# Dennis Nazar — Branded My Library Sign-In Email

The My Library page uses Supabase Auth passwordless email sign-in (`signInWithOtp`). Supabase sends the authentication email, while this project provides the branded HTML that should be used for the **Magic Link** template.

## What V12 changes

The email template has been redesigned using the supplied Catherine Kahabuka order email as the visual reference:

- Dennis Nazar logo at the top
- Dennis Nazar brand name clearly displayed
- "Official Books Store" identity
- Private Library access panel
- Clear **OPEN MY LIBRARY** button
- Secure sign-in link fallback
- Dennis Nazar branded footer
- No generic Supabase promotional footer in the template

The template is:

`supabase/templates/magic_link.html`

## Apply it to the live Supabase project

For a hosted Supabase project, open Authentication → Email Templates → Magic Link and replace the current content with the complete contents of `supabase/templates/magic_link.html`. Set the subject to:

`Dennis Nazar Private Library — Your secure access link`

Supabase documents the hosted dashboard as the place where hosted-project email templates are edited. `{{ .ConfirmationURL }}` is the supported secure magic-link variable. See the official documentation: https://supabase.com/docs/guides/auth/auth-email-templates

### Important: sender name

The HTML controls the **inside of the email**. The sender name shown by Gmail (for example, the current "Supabase") is controlled by the Supabase Auth mail/SMTP sender configuration, not by HTML.

For the most professional result, configure the sender/display name as:

`Dennis Nazar`

and use a branded sender address such as:

`no-reply@your-domain.com`

if your SMTP provider/domain supports it.

If the project uses Supabase's default email provider, sender customization may be limited by the project's plan/provider configuration. Supabase's current documentation notes restrictions on customized Auth templates for some newer free-tier projects using the default provider; a custom SMTP provider can be used when branded sending is required.

## Logo requirement

The template references:

`{{ .SiteURL }}/assets/dn-logo-white.png`

Therefore the production website must serve that file at the configured Supabase Auth Site URL.

## Book 3 image fix

The live `books` table had the third book pointing to:

`assets/book-3.jpg`

while the website package contains the actual cover as:

`assets/book-3.webp`

The live database has been corrected to `assets/book-3.webp`.

The frontend also now normalizes the old `.jpg` value to `.webp` as a defensive fallback, so the cover continues to render if an old catalog value is encountered.
