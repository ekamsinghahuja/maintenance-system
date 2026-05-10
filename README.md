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








