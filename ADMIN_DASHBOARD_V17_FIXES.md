# Admin Dashboard V17 fixes

## Orders loading
- Dashboard startup now loads general/catalog data and orders in parallel.
- Orders query selects only the fields used by the dashboard instead of `select('*')`.
- Order items are fetched only for the displayed order IDs.
- Existing search/status filtering remains client-side after the initial fetch.

## Book editor
- Fixed missing `esc()` helper in `admin.js`, which caused `esc not defined` when adding/rendering books.
- Add/Edit Book remains database-driven and supports future books.

## Simple website content editing
- Removed visible “HTML allowed” wording.
- Admin content fields now instruct administrators to enter normal text only.
- Storefront content is rendered as plain text, preventing HTML tags entered by an administrator from being interpreted as markup.
- This also prevents accidental/bad HTML from breaking the storefront.

## Scope
Admins can manage business/content data without editing code:
- store details
- colors
- website text
- books
- availability/pricing/order
- reader page uploads
- orders
- library access

Code/layout/security are intentionally not exposed as editable HTML/code fields.
