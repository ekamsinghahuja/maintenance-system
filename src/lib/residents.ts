import { getDb } from "@/lib/db";
import type { AppUserRole } from "@/lib/user-metadata";

export type ResidentRecord = {
  id: number;
  clerkUserId: string;
  email: string | null;
  flatNumber: string;
  role: AppUserRole;
  createdAt: string;
  updatedAt: string;
};

type ResidentRow = {
  id: number;
  clerk_user_id: string;
  email: string | null;
  flat_number: string;
  role: string;
  created_at: string;
  updated_at: string;
};

function mapResident(row: ResidentRow | undefined): ResidentRecord | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    email: row.email,
    flatNumber: row.flat_number,
    role: row.role === "admin" ? "admin" : "resident",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findResidentByClerkUserId(clerkUserId: string) {
  const sql = await getDb();
  const [resident] = (await sql<ResidentRow[]>`
    SELECT id, clerk_user_id, email, flat_number, role, created_at, updated_at
    FROM residents
    WHERE clerk_user_id = ${clerkUserId}
    LIMIT 1
  `) as ResidentRow[];

  return mapResident(resident);
}

export async function upsertResident(input: {
  clerkUserId: string;
  email: string | null;
  flatNumber: string;
  role: AppUserRole;
}) {
  const sql = await getDb();

  await sql`
    INSERT INTO residents (clerk_user_id, email, flat_number, role, created_at, updated_at)
    VALUES (${input.clerkUserId}, ${input.email}, ${input.flatNumber}, ${input.role}, NOW(), NOW())
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      flat_number = EXCLUDED.flat_number,
      role = EXCLUDED.role,
      updated_at = NOW()
  `;

  return findResidentByClerkUserId(input.clerkUserId);
}
