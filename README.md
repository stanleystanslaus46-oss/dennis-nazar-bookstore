# Dennis Nazar Official Books Store

Premium static storefront for Dennis Nazar digital books.

## Current customer flow

1. Choose a book.
2. Checkout and submit payment reference or screenshot.
3. Admin verifies the payment.
4. The confirmed order grants private Library access.
5. Customer signs in with the purchase email.
6. The protected reader serves book pages and saves reading progress.

The original PDF is **not** delivered as a public customer download.

## Reader architecture

`source PDF -> page images -> private book-pages storage -> book_pages -> protected reader`

See `LIBRARY_READER_SETUP.md` for the ingestion process.

## Customer emails

The project includes a Dennis Nazar branded Magic Link template and branded transaction/access emails. Resend can be connected later when a verified sending domain is available.

## Important

The real book page images still need to be populated before customer reading can be enabled.
