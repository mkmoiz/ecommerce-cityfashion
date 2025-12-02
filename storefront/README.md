# Storefront (Next.js + App Router)

Front-end for Priya Collections with luxury UI, categories, PDP, cart, and Razorpay checkout. Admin console secured via credentials-based login.

## Setup
1) Copy env file
```bash
cp .env.local.example .env.local
```
Set `NEXTAUTH_*`, `GOOGLE_CLIENT_*`, and `NEXT_PUBLIC_API_URL` for your backend. Admin uses credential login now (no public token).

2) Install deps & run
```bash
npm install
npm run dev
```

## Admin auth
- Backend: set `ADMIN_USER_ID` and `ADMIN_PASSWORD` in `ecommerce-api/.env`.
- Login at `/admin/login`; token is stored in cookie/localStorage and used for admin API calls.

## Payments
- Razorpay checkout on `/cart`. Backend requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

## API expectations
- Storefront: `/store/products`, `/store/products/:slug`, `/store/categories`, `/store/categories/:slug`
- Admin: `/admin/*` requires Bearer JWT from admin login.
- Payments: `/payments/razorpay/order` creates Razorpay order.

## Notes
- Images: `R2_PUBLIC_URL` should be a public base ending with `/` (e.g., `https://...r2.dev/`).
- Cart: client-side with localStorage persistence.
# frontend-ecommerce
