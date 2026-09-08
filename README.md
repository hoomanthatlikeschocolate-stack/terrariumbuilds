# TerrariumBuilds

Terrarium shop and animal habitat tutorials, deployed on Vercel with a Supabase Edge Function and isolated `tb_*` database tables.

## Features

- Public shop with categories, product details, stock checks, a persistent bag, payment links, and manual order requests.
- Member registration/login and guest browsing/ordering. Members can view their own requests.
- Two owner accounts. Ctrl+Alt+H or Owner access opens the gateway, then the owner login.
- Listings and tutorials: add, edit, delete, publish/unpublish, upload images.
- Private owner chat, including private image attachments, and an order management view.

## Deployment

Deploy `public/`, `api/terrarium.js`, and `vercel.json` as a Vercel project named `terrariumbuilds`. No build dependencies are needed. The frontend uses a same-origin Node API proxy; session and gateway tokens are stored only in Secure HttpOnly SameSite cookies.

`backend/index.ts` is deployed as Supabase Edge Function `terrariumbuilds-api`. The function uses Supabase's runtime-provided service role key; this key must never be placed in frontend files. `verify_jwt=false` is intentional: all private actions validate a custom, expiring server session and owner role. Database tables use RLS and deny direct anon/authenticated access.

The two owner credentials and gateway code are provisioned separately as salted PBKDF2-SHA256 hashes (210,000 iterations). No passwords or password hashes belong in this repository. New accounts always receive the member role. A database constraint limits owners to the two approved names.

The existing Supabase project is shared with earlier apps, but all TerrariumBuilds data, sessions, uploads, and accounts are separate. The public `terrariumbuilds` bucket contains listing/tutorial images. The private `terrariumbuilds-chat` bucket contains owner attachments, returned only as short-lived signed URLs after owner authentication.

## Store setup

The twelve starter products are coming-soon catalog entries: stock is zero and prices are unset. Owners should supply real prices, quantities, item descriptions, photos, and shipping/payment arrangements before selling. Adding a HTTPS checkout link enables Buy now for an available product. Without one, buyers can submit order requests. Requests do not charge or reserve stock. Owners confirm availability and shipping, collect payment, update status, and adjust listing stock.

## Content

Three starter build guides include linked husbandry references. Owners are responsible for checking species-specific care before publishing further tutorials. The hero photograph is credited to Life.Time.Values on Unsplash: https://unsplash.com/photos/FOpKdtpJmeg . It is illustrative and does not represent an item for sale.

## Maintenance

`backend/schema.sql` records the schema; `backend/starter-content.json` contains the original catalog and guides. Regularly remove expired `tb_sessions` and old `tb_attempts` records. This first version uses username/password membership and has no automated password recovery. The Vercel deployment is uploaded through the connected deployment API; GitHub source is preserved in the `terrariumbuilds` branch under `terrariumbuilds/`.
