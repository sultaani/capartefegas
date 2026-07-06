# Capartefegas — Storefront & Admin Console

A production-ready full-stack e-commerce platform for **Capartefegas**, a premium
Nigerian streetwear brand. Built with Next.js 16 (App Router), TypeScript,
PostgreSQL + Drizzle ORM, and a session-authenticated admin dashboard — exactly
to the spec of the original product brief: an editorial storefront with no
accounts/no payment gateway, WhatsApp-driven checkout, and a full admin
operating system behind it.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Custom session cookies (signed JWT via `jose`, bcrypt password hashing) |
| Images | Cloudinary (signed uploads) |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Validation | Zod |

---

## 2. Prerequisites

Install these before you start:

- **Node.js 20.9 or newer** — check with `node -v`
- **npm** (comes with Node)
- **PostgreSQL 14+** — either:
  - installed locally ([postgresql.org/download](https://www.postgresql.org/download/)), **or**
  - a free hosted instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com) (recommended — no local install needed)
- A **Cloudinary** account (free tier is fine) — [cloudinary.com](https://cloudinary.com) — for product/collection image uploads
- (Optional for full checkout testing) A WhatsApp number to use as the business contact line

---

## 3. Step-by-step: running it locally

### Step 1 — Install dependencies

```bash
cd capartefegas
npm install
```

### Step 2 — Set up a PostgreSQL database

**Option A — Local Postgres**

*macOS (Homebrew):*
```bash
brew install postgresql@16
brew services start postgresql@16
createuser capartefegas --pwprompt --createdb
createdb capartefegas -O capartefegas
```

*Ubuntu/Debian:*
```bash
sudo apt-get update && sudo apt-get install -y postgresql
sudo -u postgres psql -c "CREATE USER capartefegas WITH PASSWORD 'yourpassword' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE capartefegas OWNER capartefegas;"
```

*Windows:*

1. Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) (the EDB installer is the standard pick) and run it.
2. During setup:
   - Keep the default port `5432`.
   - Set a password for the `postgres` superuser — write it down, you'll need it for the next step.
   - Leave "Stack Builder" unchecked at the end; you don't need it.
3. Open **SQL Shell (psql)** from the Start menu (installed alongside Postgres). Press Enter through the prompts (Server/Database/Port/Username) until it asks for the **password** — enter the `postgres` superuser password you just set.
4. At the `postgres=#` prompt, run:
   ```sql
   CREATE USER capartefegas WITH PASSWORD 'yourpassword' CREATEDB;
   CREATE DATABASE capartefegas OWNER capartefegas;
   ```
5. Type `\q` and press Enter to exit.

Your connection string for `.env` will be:
```
DATABASE_URL=postgresql://capartefegas:yourpassword@localhost:5432/capartefegas
```

*Alternative for Windows (if you prefer a package manager over the GUI installer):*
```powershell
winget install PostgreSQL.PostgreSQL
```
This installs the same thing as the EDB installer above — you'll still set the
superuser password during setup and run the same `psql` commands in step 4.

> If any of this feels heavier than you want, **Option B below (Neon/Supabase)
> skips local Postgres entirely** — it's the faster path on Windows since there's
> nothing to install.

**Option B — Neon / Supabase (no local install)**

1. Create a free project at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
2. Copy the connection string it gives you (looks like `postgresql://user:pass@host/dbname?sslmode=require`).

### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```bash
DATABASE_URL=postgresql://capartefegas:yourpassword@localhost:5432/capartefegas
SESSION_SECRET=          # generate one below
CLOUDINARY_CLOUD_NAME=   # from your Cloudinary dashboard
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
WHATSAPP_NUMBER=2348000000000   # your real business WhatsApp number, country code, no + or spaces
SEED_ADMIN_EMAIL=admin@capartefegas.com
SEED_ADMIN_PASSWORD=ChangeMe123!
```

Generate a `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

Paste the output as the value of `SESSION_SECRET`.

> Cloudinary values aren't required for the app to start, but the admin
> image-signature endpoint will fail without them. You can leave placeholder
> values to get the app running first and fill these in later.

### Step 4 — Run database migrations

This creates all the tables:

```bash
npm run db:migrate
```

Expected output:
```
Running migrations...
Migrations complete.
```

### Step 5 — Seed sample data

This creates categories, collections, six sample products with stock, shipping
rates, default site settings, and your **admin login**:

```bash
npm run db:seed
```

Expected output ends with:
```
Admin login -> email: admin@capartefegas.com / password: ChangeMe123!
Seed complete.
```

(Or whatever you set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` to in `.env`.)

### Step 6 — Run the dev server

```bash
npm run dev
```

Open:
- **Storefront** → [http://localhost:3000](http://localhost:3000)
- **Admin console** → [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Log into the admin console with the credentials printed by the seed script.

---

## 4. Building for production

```bash
npm run build
npm start
```

`npm run build` also type-checks the whole project — if it fails, fix the
reported errors before deploying.

---

## 5. Deploying

A common, low-cost combo:

1. **Database**: create a production Postgres instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Run migrations and seed against that production `DATABASE_URL` from your machine:
   ```bash
   DATABASE_URL="<production-url>" npm run db:migrate
   DATABASE_URL="<production-url>" npm run db:seed   # optional — skip if you don't want demo data in production
   ```
3. **App hosting**: push this repo to GitHub, then import it into [Vercel](https://vercel.com).
4. In the Vercel project settings, add all the same environment variables from
   your `.env` (using the production `DATABASE_URL`, a fresh `SESSION_SECRET`,
   and your real Cloudinary + WhatsApp values).
5. Deploy. Vercel runs `npm run build` automatically.

**Immediately after first deploy:** log into `/admin/login` with the seeded
credentials and change the admin password by creating a new admin user
directly in the database (there's no self-service "change password" UI yet —
see §7 below).

---

## 6. Project structure

```
src/
├── app/
│   ├── (storefront)/        # customer-facing site — its own root layout
│   │   ├── layout.tsx        # Navbar, Footer, CartProvider, fonts
│   │   ├── page.tsx          # homepage
│   │   ├── catalogue/
│   │   ├── collections/
│   │   ├── product/[slug]/
│   │   ├── checkout/
│   │   ├── about/
│   │   └── contact/
│   ├── admin/                # admin console — its OWN root layout (no storefront chrome)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── (dashboard)/      # everything behind the sidebar
│   │       ├── page.tsx       # dashboard / analytics
│   │       ├── products/
│   │       ├── orders/
│   │       ├── collections/
│   │       ├── homepage/      # hero/promo banner + featured-product flags
│   │       ├── messages/
│   │       ├── shipping/
│   │       ├── newsletter/
│   │       └── settings/
│   └── api/                  # route handlers — public + /api/admin/* (protected)
├── components/
│   ├── storefront/
│   └── admin/
├── lib/
│   ├── db/
│   │   ├── schema.ts         # the entire data model
│   │   ├── index.ts          # DB client
│   │   ├── migrate.ts        # migration runner
│   │   └── seed.ts           # demo data + admin account
│   ├── session.ts            # signed-cookie session auth (edge-safe)
│   ├── auth.ts                # password hashing
│   ├── order-number.ts        # atomic CPT/XX/YYYYMMDDNNN generator
│   ├── whatsapp.ts            # builds the prefilled WhatsApp message
│   ├── analytics.ts            # dashboard metrics (delivered-only revenue)
│   └── cloudinary.ts
└── proxy.ts                   # route protection for /admin and /api/admin (Next 16's
                                # successor to middleware.ts)
```

---

## 7. What's real vs. what's a known simplification

Everything in this codebase runs against a real Postgres database and was
tested end-to-end while building it — including concurrent-checkout stock
locking (two customers can't both buy the last unit of a size) and atomic
order-number generation. A few things are intentionally left as next steps
rather than fully built, so you're not surprised later:

- **Image uploads**: the Cloudinary signature endpoint
  (`/api/admin/cloudinary-signature`) is implemented and ready, but the admin
  product/collection forms currently take a pasted image **URL** rather than a
  drag-and-drop upload widget. Wiring a file picker to the existing signature
  endpoint is a small, contained addition.
- **No password-reset flow** for the admin account yet — change it by updating
  the `admin_users` row directly (re-hash with `bcryptjs`) or by re-running a
  modified seed script.
- **No automated tests** are included. Given the business-critical paths
  (checkout, stock, auth), adding integration tests around
  `src/app/api/orders/route.ts` and `src/lib/order-number.ts` would be the
  highest-value next addition.
- A full-text/typeahead search overlay and a "quick view" product modal from
  the earlier prototype were intentionally left out of this build to keep
  scope to what's in the original product brief — the catalogue's
  search/filter/sort covers the same need with one extra click.

---

## 8. Useful commands

```bash
npm run dev          # start dev server
npm run build        # production build (also type-checks everything)
npm start            # run a production build
npm run db:generate  # generate a new migration after editing schema.ts
npm run db:migrate   # apply pending migrations
npm run db:seed      # (re-)seed demo data — safe to re-run, uses ON CONFLICT DO NOTHING
npm run db:studio    # opens Drizzle Studio, a GUI for browsing your database
```

---

## 9. Troubleshooting

**`DATABASE_URL is not set`**
You haven't copied `.env.example` to `.env`, or forgot to fill it in.

**`connect ECONNREFUSED 127.0.0.1:5432`**
Postgres isn't running. Start it (`brew services start postgresql@16`,
`sudo service postgresql start`, or check your Neon/Supabase dashboard if
using a hosted instance).

**Migrations run but the storefront shows no products**
You ran `db:migrate` but not `db:seed`. Run `npm run db:seed`.

**`next/font` errors fetching Google Fonts during build**
Your build machine needs outbound internet access to `fonts.googleapis.com`
and `fonts.gstatic.com` at build time (Next downloads and self-hosts the font
files at build time — there's no runtime dependency on Google after that).
This works on Vercel and any normal machine with internet access.

**`npm audit` shows a handful of moderate vulnerabilities**
These come from `drizzle-kit`'s bundled `esbuild` (used only for local
migration/seed scripts, never shipped to production) and Next's own internal
copy of `postcss` (used only at build time). Both are dev-time-only and don't
affect the deployed app; there's currently no newer release that clears them
without a major Next.js downgrade.

---

## 10. Security checklist before going live

- [ ] Set a strong, unique `SESSION_SECRET` in production (never reuse the dev one)
- [ ] Change the seeded admin password
- [ ] Confirm `DATABASE_URL` uses `sslmode=require` for any cloud Postgres provider
- [ ] Set your real `WHATSAPP_NUMBER` and verify the checkout message looks right
- [ ] Double-check Cloudinary credentials are the production ones, not a shared dev account
