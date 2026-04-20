import postgres from "postgres";

type SqlClient = ReturnType<typeof postgres>;

declare global {
  var __maintenanceSql: SqlClient | undefined;
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing. Add your Neon connection string to .env.local.",
    );
  }

  if (!globalThis.__maintenanceSql) {
    globalThis.__maintenanceSql = postgres(process.env.DATABASE_URL, {
      prepare: false,
    });
  }

  return globalThis.__maintenanceSql;
}

async function initializeDatabase() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS residents (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL UNIQUE,
      email TEXT,
      flat_number TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'resident',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS residents_clerk_user_id_idx
    ON residents(clerk_user_id)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      flat_number TEXT NOT NULL,
      initiative_slug TEXT NOT NULL,
      initiative_name TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Paid',
      paid_for_month TEXT NOT NULL,
      reference TEXT,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS payments_lookup_idx
    ON payments(clerk_user_id, initiative_slug, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS initiatives (
      id BIGSERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      amount NUMERIC(12, 2) NOT NULL,
      due_day INTEGER NOT NULL,
      frequency TEXT NOT NULL,
      tenor_months INTEGER,
      total_target NUMERIC(12, 2),
      status TEXT NOT NULL DEFAULT 'active',
      razorpay_account_id TEXT,
      start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by_clerk_user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE initiatives
    ADD COLUMN IF NOT EXISTS razorpay_account_id TEXT
  `;

  await sql`
    ALTER TABLE initiatives
    ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS initiatives_status_idx
    ON initiatives(status, created_at DESC)
  `;
}

export async function getDb() {
  await initializeDatabase();

  return getSql();
}
