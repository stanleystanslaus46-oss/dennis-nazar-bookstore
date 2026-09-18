# V13 Email System

- Unified Dennis Nazar branded HTML email shell for transactional messages.
- Branded payment confirmation email.
- Branded Library access reminder.
- Branded payment rejection email.
- Magic Link template retained for Supabase Auth.
- All customer messaging points to Private Library access, not PDF delivery.
- Removed obsolete PDF upload/download language from the admin book editor and setup docs.
- `PUBLIC_SITE_URL` is now required by transactional Edge Functions instead of silently falling back to an unowned domain.
