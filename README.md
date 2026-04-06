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
```

PayPal notes:
- `PAYPAL_CLIENT_ID` is read server-side and exposed to the checkout only through `/api/paypal/config` so the PayPal SDK can load.
- `PAYPAL_CLIENT_SECRET` stays server-side only and is now used only in the server routes that create and capture PayPal orders.
- Payment method remains PayPal only.

Supabase notes:
- apply [supabase/schema.sql](/root/HomeTech-Bielefeld-next/supabase/schema.sql) before expecting categories, carts, orders, or profiles to persist in Supabase
- Google OAuth still depends on the Google provider and redirect URLs being configured in the Supabase dashboard
