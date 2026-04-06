# HomeTech Bielefeld Next.js Remake

Controlled remake focused on:
- solid mobile navigation
- predictable product interactions
- a small curated assortment
- simple checkout with PayPal
- modular routing and smaller files

Run locally:

```bash
cd /root/HomeTech-Bielefeld-next
npm run dev:local
```

Run local production:

```bash
cd /root/HomeTech-Bielefeld-next
npm run build
npm run start:local
```

Env setup:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET=product-images
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

PayPal notes:
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` stay server-side and are used for the server routes that create and capture PayPal orders.
- `PAYPAL_ENV` controls whether the redirect checkout talks to `sandbox` or `live`.
- Checkout uses a redirect-based PayPal approval flow and returns to `/checkout` for capture.
- Payment method remains PayPal only.

Visual checks:
- `npm run test:visual` builds the app, runs Playwright in production mode and writes screenshots plus report to `artifacts/playwright/`.
- screenshots: `artifacts/playwright/screenshots/mobile/` and `artifacts/playwright/screenshots/desktop/`
- screenshot manifest: `artifacts/playwright/screenshots/manifest.json`
- comparison helper output: `artifacts/playwright/comparison-manifest.json`
- Playwright HTML report: `artifacts/playwright/report/index.html`

Supabase notes:
- apply [supabase/schema.sql](/root/HomeTech-Bielefeld-next/supabase/schema.sql) before expecting categories, carts, orders, or profiles to persist in Supabase
- enable Google in Supabase Auth and paste `GOOGLE_CLIENT_ID` plus `GOOGLE_CLIENT_SECRET` there
- allowed app redirects should include `http://localhost:3000/konto` and your production `/konto` URL
- Google Cloud must include the Supabase callback URL `https://kzpdsndpxqbqsyekfvsi.supabase.co/auth/v1/callback`

Auth notes:
- E-Mail auth now uses registration with password, confirmation by e-mail, password sign-in, and password reset by recovery link.
- The Next.js app does not read `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` directly in browser code. Those values belong in the Supabase Auth provider settings.

Card payments:
- PayPal stays separate from card payments.
- Card payments are prepared as a separate Stripe-backed section.
- Add `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` when you want to activate cards.
