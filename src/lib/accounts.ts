import { getDb } from "@/lib/db";

export type RazorpayAccount = {
  id: string;
  key_id: string;
  key_secret: string;
  display_name?: string;
};

function parseAccounts(): Record<string, RazorpayAccount> {
  try {
    const accountsJson = process.env.RAZORPAY_ACCOUNTS;
    if (!accountsJson) {
      console.warn("RAZORPAY_ACCOUNTS environment variable not set");
      return {};
    }
    return JSON.parse(accountsJson);
  } catch (error) {
    console.error("Failed to parse RAZORPAY_ACCOUNTS:", error);
    return {};
  }
}

const allAccounts = parseAccounts();

export function getAllAccounts(): Record<string, RazorpayAccount> {
  return allAccounts;
}

export async function getAccountForInitiative(initiativeSlug: string): Promise<RazorpayAccount | null> {
  try {
    const sql = await getDb();
    const [row] = (await sql<{ razorpay_account_id: string | null }[]>`
      SELECT razorpay_account_id FROM initiatives WHERE slug = ${initiativeSlug} LIMIT 1
    `) as { razorpay_account_id: string | null }[];

    if (!row?.razorpay_account_id) {
      console.warn(`No account assigned for initiative: ${initiativeSlug}`);
      return null;
    }

    const account = allAccounts[row.razorpay_account_id];
    if (!account) {
      console.warn(`Account not found for id: ${row.razorpay_account_id}`);
      return null;
    }

    return account;
  } catch (error) {
    console.error("Error fetching account for initiative:", error);
    return null;
  }
}

export function getAccountById(accountId: string): RazorpayAccount | null {
  return allAccounts[accountId] || null;
}