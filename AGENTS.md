# ShopLedger

## Stack
- Node.js CommonJS app using Express and body-parser.
- Browser UI is static HTML, CSS, and JavaScript in `public/`.
- App data is persisted in `data/db.json` through `lib/store.js`.

## Module map
- `routes/products.js` — product and active coupon listing endpoints.
- `routes/orders.js` — order listing, lookup, creation, and cancellation endpoints.
- `routes/customers.js` — customer listing and Khata settlement endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, lookup, validation, and discount calculation.
- `lib/dates.js` — date and fiscal-year helpers.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, reservation, release, and summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer lookup, Khata billing/reversal, balances, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, discount delegation, and checkout totals.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — synchronous JSON database read/write and audit log updates.
- `lib/tax.js` — GST rate lookup, slab percentage, rounding, and CGST/SGST split.

## Commands
- Start the app: `node server.js` (or `npm start`).
- Run tests: `node --test`.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
