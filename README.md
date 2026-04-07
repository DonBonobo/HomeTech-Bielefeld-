# HomeTech Bielefeld

Mobile-first local-commerce storefront built with Next.js and Supabase.

## Checkout env

Set these on local and server deployments:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV=sandbox|live`
- `APP_BASE_URL` optional, only if you need an explicit canonical origin elsewhere

Do not commit secrets.

## Current checkout routes

- `/cart`
- `/checkout`
- `/checkout/success/[orderId]`
- `/checkout/cancel`
- `/checkout/failure`
- `/order-request/[requestId]` for the manual fallback path

## PayPal flow

- The PayPal button is rendered with the official PayPal JavaScript SDK on the checkout page.
- The backend creates Orders v2 orders server-side from trusted product data.
- The backend captures Orders v2 orders server-side and only marks the order as `paid` after a verified successful capture.
- Totals are never trusted from the browser.
- Manual order request remains available as a truthful fallback if PayPal is unavailable or intentionally skipped.

## Local QA

Build once, then run the production server:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

Run the checkout QA suite:

```bash
npm run qa:paypal -- http://127.0.0.1:3000
```

That script verifies:

- PayPal config route
- server-side PayPal order creation
- cancel persistence
- validation failure path
- manual order-request fallback
- PayPal button rendering on the checkout page

Live capture still requires a sandbox or live buyer approval account.
