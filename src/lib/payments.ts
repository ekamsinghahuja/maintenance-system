import { getDb } from "@/lib/db";

export type ResidentPaymentRecord = {
  id: string;
  clerkUserId: string;
  flatNumber: string;
  initiativeSlug: string;
  initiativeName: string;
  amount: number;
  method: string;
  status: string;
  paidForMonth: string;
  reference: string | null;
  note: string | null;
  createdAt: string;
};

type PaymentRow = {
  id: string | number;
  clerk_user_id: string;
  flat_number: string;
  initiative_slug: string;
  initiative_name: string;
  amount: string | number;
  method: string;
  status: string;
  paid_for_month: string;
  reference: string | null;
  note: string | null;
  created_at: string;
};

function mapPayment(row: PaymentRow): ResidentPaymentRecord {
  return {
    id: String(row.id),
    clerkUserId: row.clerk_user_id,
    flatNumber: row.flat_number,
    initiativeSlug: row.initiative_slug,
    initiativeName: row.initiative_name,
    amount: Number(row.amount),
    method: row.method,
    status: row.status,
    paidForMonth: row.paid_for_month,
    reference: row.reference,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function listPaymentsForResidentInitiative(input: {
  clerkUserId: string;
  initiativeSlug: string;
}) {
  const sql = await getDb();
  const rows = (await sql<PaymentRow[]>`
    SELECT id, clerk_user_id, flat_number, initiative_slug, initiative_name, amount,
           method, status, paid_for_month, reference, note, created_at
    FROM payments
    WHERE clerk_user_id = ${input.clerkUserId}
      AND initiative_slug = ${input.initiativeSlug}
    ORDER BY created_at DESC
  `) as PaymentRow[];

  return rows.map(mapPayment);
}

export async function listPaymentsForInitiative(initiativeSlug: string) {
  const sql = await getDb();
  const rows = (await sql<PaymentRow[]>`
    SELECT id, clerk_user_id, flat_number, initiative_slug, initiative_name, amount,
           method, status, paid_for_month, reference, note, created_at
    FROM payments
    WHERE initiative_slug = ${initiativeSlug}
    ORDER BY created_at DESC
  `) as PaymentRow[];

  return rows.map(mapPayment);
}

export async function listResidentPaymentStatusForInitiative(initiativeSlug: string) {
  const sql = await getDb();
  return (await sql<{
    flat_number: string;
    email: string | null;
    clerk_user_id: string;
    paid_total: string | number | null;
    payment_count: string | number;
    last_paid_at: string | null;
  }[]>`
    SELECT
      residents.flat_number,
      residents.email,
      residents.clerk_user_id,
      COALESCE(SUM(payments.amount), 0) AS paid_total,
      COUNT(payments.id) AS payment_count,
      MAX(payments.created_at) AS last_paid_at
    FROM residents
    LEFT JOIN payments
      ON payments.clerk_user_id = residents.clerk_user_id
      AND payments.initiative_slug = ${initiativeSlug}
    WHERE residents.role = 'resident'
    GROUP BY residents.flat_number, residents.email, residents.clerk_user_id
    ORDER BY residents.flat_number ASC
  `).map((row) => ({
    flatNumber: row.flat_number,
    email: row.email,
    clerkUserId: row.clerk_user_id,
    paidTotal: Number(row.paid_total ?? 0),
    paymentCount: Number(row.payment_count),
    lastPaidAt: row.last_paid_at,
  }));
}

export async function createPayment(input: {
  clerkUserId: string;
  flatNumber: string;
  initiativeSlug: string;
  initiativeName: string;
  amount: number;
  method: string;
  paidForMonth: string;
  reference: string | null;
  note: string | null;
}) {
  const sql = await getDb();
  const [row] = (await sql<PaymentRow[]>`
    INSERT INTO payments (
      clerk_user_id,
      flat_number,
      initiative_slug,
      initiative_name,
      amount,
      method,
      status,
      paid_for_month,
      reference,
      note
    )
    VALUES (
      ${input.clerkUserId},
      ${input.flatNumber},
      ${input.initiativeSlug},
      ${input.initiativeName},
      ${input.amount},
      ${input.method},
      'Paid',
      ${input.paidForMonth},
      ${input.reference},
      ${input.note}
    )
    RETURNING id, clerk_user_id, flat_number, initiative_slug, initiative_name, amount,
              method, status, paid_for_month, reference, note, created_at
  `) as PaymentRow[];

  return mapPayment(row);
}
