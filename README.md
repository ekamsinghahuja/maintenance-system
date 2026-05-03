Maintenance System is a Next.js app for collecting apartment/society fees. Admins create initiatives (Maintenance, Construction, etc.) with configuration (amount, due date, frequency/tenor), residents log in, pick a flat number, and record payments against initiatives.

Status: feature development (MVP flows work; payment gateway integration is optional/ongoing).
## Architecture Diagram
<img width="808" height="530" alt="image" src="https://github.com/user-attachments/assets/c9ef4a87-ef28-48b0-8245-13da862ddafa" />

## Features

- Clerk authentication (Google / email).
- Resident onboarding to capture `flatNumber` (also stored in the DB).
- Admin initiatives:
  - Create initiative with amount, due date, frequency, tenor (months), total target, description.
  - Admin initiative detail view with flat-wise payment totals + recent activity.
- Analytics (already integrated):
  - Admin analytics pages for initiative-level and aggregate reporting.
- Resident initiatives:
  - Simple initiative list on `/resident`.
  - Initiative detail page with “record payment” form + payment trail.
- Razorpay (already integrated):
  - API routes to create orders and verify payments.
  - Optional multi-account configuration via `RAZORPAY_ACCOUNTS`.
- Neon Postgres persistence (`residents`, `initiatives`, `payments`).

## Tech Stack

- Next.js App Router (`src/app`)
- Clerk (`@clerk/nextjs`)
- Neon Postgres (via `postgres` package)
- Tailwind CSS v4

## Setup

1) Install deps

```bash
npm install
```

2) Configure environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Fill values in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://neondb_owner:...@.../neondb?sslmode=require
ADMIN_EMAILS=you@domain.com,another@domain.com
RAZORPAY_ACCOUNTS='{"account1":{"id":"account1","key_id":"...","key_secret":"...","display_name":"Main"}}'
```

Notes:
- `ADMIN_EMAILS` controls who is treated as admin.
- `RAZORPAY_ACCOUNTS` is optional and only needed if you are wiring Razorpay accounts per initiative.

3) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## How It Works

### Auth + Roles

- Clerk handles sign-in/sign-up routes.
- On first login, the user completes onboarding and chooses a flat number.
- If the signed-in user’s email is listed in `ADMIN_EMAILS`, the app routes them to `/admin`.

### Database

The app uses Neon Postgres and creates required tables automatically on demand (no migrations yet):

- `residents`: maps `clerk_user_id` -> `flat_number`, `role`, `email`
- `initiatives`: admin-created initiative configuration (slug, amount, due day, tenor, target, etc.)
- `payments`: resident-recorded payments per initiative

Schema bootstrapping currently lives in `src/lib/db.ts`.

## Main Routes

- `/` landing
- `/resident` resident dashboard (initiative list)
- `/initiative/[slug]` resident initiative detail + payment form
- `/admin` admin dashboard + create initiative
- `/admin/initiative/[slug]` admin initiative detail + flat-wise status
- `/admin/analytics` admin analytics overview
- `/admin/analytics/[slug]` initiative analytics
- `/onboarding` pick flat number

## API Routes

- `/api/initiatives` initiatives API (admin-facing)
- `/api/create-order` Razorpay order creation
- `/api/verify-payment` Razorpay payment verification
- `/api/analytics/all` aggregate analytics
- `/api/analytics/[slug]` initiative analytics

## Development Notes / Roadmap

- Replace “auto-create tables in app startup” with migrations (recommended for production).
- Add true billing logic:
  - month-by-month expected schedule based on `start_date`, `frequency`, and `tenor_months`
  - overdue, carry-forward credit, and ledger statements
- Add payment gateway verification (Razorpay/Stripe) instead of manual “record payment”.
- Admin controls:
  - edit/close initiative
  - export statements and collection reports
