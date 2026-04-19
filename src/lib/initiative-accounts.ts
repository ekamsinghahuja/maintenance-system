// lib/initiative-accounts.ts
import { getAllAccounts, getAccountForInitiative, getAccountById, type RazorpayAccount } from "@/lib/accounts";

export async function getInitiativeAccountInfo(initiativeSlug: string) {
  const account = await getAccountForInitiative(initiativeSlug);
  
  if (!account) {
    return null;
  }

  return {
    accountId: account.id,
    displayName: account.display_name || account.id,
    keyId: account.key_id,
    // Don't expose the secret to the client
  };
}

export function getAllAccountsList() {
  const accounts = getAllAccounts();
  return Object.values(accounts).map((account) => ({
    id: account.id,
    displayName: account.display_name || account.id,
    // Don't expose secrets
  }));
}

export function getAccountDetails(accountId: string): RazorpayAccount | null {
  return getAccountById(accountId);
}
