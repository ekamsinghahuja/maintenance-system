import { getDb } from "@/lib/db";

export type InitiativeRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  amount: number;
  dueDay: number;
  frequency: string;
  tenorMonths: number | null;
  totalTarget: number | null;
  status: string;
  razorpayAccountId: string | null;
  startDate: string;
  createdByClerkUserId: string;
  createdAt: string;
  updatedAt: string;
};

type InitiativeRow = {
  id: string | number;
  slug: string;
  name: string;
  description: string | null;
  amount: string | number;
  due_day: number;
  frequency: string;
  tenor_months: number | null;
  total_target: string | number | null;
  status: string;
  razorpay_account_id: string | null;
  start_date: string;
  created_by_clerk_user_id: string;
  created_at: string;
  updated_at: string;
};

function mapInitiative(row: InitiativeRow): InitiativeRecord {
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    description: row.description,
    amount: Number(row.amount),
    dueDay: row.due_day,
    frequency: row.frequency,
    tenorMonths: row.tenor_months,
    totalTarget: row.total_target == null ? null : Number(row.total_target),
    status: row.status,
    razorpayAccountId: row.razorpay_account_id,
    startDate: row.start_date,
    createdByClerkUserId: row.created_by_clerk_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function createUniqueSlug(baseName: string) {
  const sql = await getDb();
  const base = slugify(baseName) || "initiative";

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const [existing] = (await sql<{ slug: string }[]>`
      SELECT slug
      FROM initiatives
      WHERE slug = ${candidate}
      LIMIT 1
    `) as { slug: string }[];

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique slug for the initiative.");
}

export async function listInitiatives() {
  const sql = await getDb();
  const rows = (await sql<InitiativeRow[]>`
    SELECT id, slug, name, description, amount, due_day, frequency, tenor_months,
           total_target, status, razorpay_account_id, start_date, created_by_clerk_user_id, created_at, updated_at
    FROM initiatives
    WHERE status = 'active'
    ORDER BY created_at DESC
  `) as InitiativeRow[];

  return rows.map(mapInitiative);
}

export async function findInitiativeBySlug(slug: string) {
  const sql = await getDb();
  const [row] = (await sql<InitiativeRow[]>`
    SELECT id, slug, name, description, amount, due_day, frequency, tenor_months,
           total_target, status, razorpay_account_id, start_date, created_by_clerk_user_id, created_at, updated_at
    FROM initiatives
    WHERE slug = ${slug}
    LIMIT 1
  `) as InitiativeRow[];

  return row ? mapInitiative(row) : null;
}

export async function findInitiativeByName(name: string) {
  const sql = await getDb();
  const [row] = (await sql<InitiativeRow[]>`
    SELECT id, slug, name, description, amount, due_day, frequency, tenor_months,
           total_target, status, razorpay_account_id, start_date, created_by_clerk_user_id, created_at, updated_at
    FROM initiatives
    WHERE name = ${name} AND status = 'active'
    LIMIT 1
  `) as InitiativeRow[];

  return row ? mapInitiative(row) : null;
}

export async function createInitiative(input: {
  name: string;
  description: string | null;
  amount: number;
  dueDay: number;
  frequency: string;
  tenorMonths: number | null;
  totalTarget: number | null;
  razorpayAccountId: string | null;
  createdByClerkUserId: string;
}) {
  const sql = await getDb();
  const slug = await createUniqueSlug(input.name);
  const [row] = (await sql<InitiativeRow[]>`
    INSERT INTO initiatives (
      slug,
      name,
      description,
      amount,
      due_day,
      frequency,
      tenor_months,
      total_target,
      status,
      razorpay_account_id,
      start_date,
      created_by_clerk_user_id,
      created_at,
      updated_at
    )
    VALUES (
      ${slug},
      ${input.name},
      ${input.description},
      ${input.amount},
      ${input.dueDay},
      ${input.frequency},
      ${input.tenorMonths},
      ${input.totalTarget},
      'active',
      ${input.razorpayAccountId},
      NOW(),
      ${input.createdByClerkUserId},
      NOW(),
      NOW()
    )
    RETURNING id, slug, name, description, amount, due_day, frequency, tenor_months,
              total_target, status, razorpay_account_id, start_date, created_by_clerk_user_id, created_at, updated_at
  `) as InitiativeRow[];

  return mapInitiative(row);
}
