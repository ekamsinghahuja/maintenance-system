This is a Next.js app for collecting apartment maintenance fees with Clerk-based authentication.

## Authentication flow

- Residents sign up with Clerk using Google or email.
- After the first sign-in, the app asks for the resident's flat number.
- The flat number is stored in Clerk `publicMetadata.flatNumber`.
- The same resident record is mirrored into your Neon Postgres database.
- Admin routing can be enabled by listing email addresses in `ADMIN_EMAILS`.

## Environment variables

Create a `.env.local` file from `.env.example` and add your Clerk keys:

```bash
cp .env.example .env.local
```

Required:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://neondb_owner:your_password@your-neon-host/neondb?sslmode=require
```

Optional:

```bash
ADMIN_EMAILS=secretary@yourbuilding.com,treasurer@yourbuilding.com
```

In the Clerk dashboard, enable Google as a social connection if you want Google sign-in.
In Neon, paste your real connection string into `.env.local` as `DATABASE_URL`.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
