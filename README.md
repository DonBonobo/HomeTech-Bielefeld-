# HomeTech Bielefeld Next.js Remake

Controlled remake focused on:
- solid mobile navigation
- predictable product interactions
- a small launch assortment
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
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

PayPal notes:
- `PAYPAL_CLIENT_ID` is read server-side and exposed to the checkout only through `/api/paypal/config` so the PayPal SDK can load.
- `PAYPAL_CLIENT_SECRET` stays server-side only and is stored for later server-side order flows. It is not used in browser code yet.
- Launch payment method remains PayPal only.
