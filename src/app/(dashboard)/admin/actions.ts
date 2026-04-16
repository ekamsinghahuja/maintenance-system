"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createInitiative } from "@/lib/initiatives";

export type InitiativeActionState = {
  error?: string;
  success?: string;
};

export async function createInitiativeAction(
  _previousState: InitiativeActionState,
  formData: FormData,
): Promise<InitiativeActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Please sign in again before creating an initiative." };
  }

  const name = formData.get("name");
  const description = formData.get("description");
  const amount = formData.get("amount");
  const dueDay = formData.get("dueDay");
  const frequency = formData.get("frequency");
  const tenorMonths = formData.get("tenorMonths");
  const totalTarget = formData.get("totalTarget");

  if (
    typeof name !== "string" ||
    typeof amount !== "string" ||
    typeof dueDay !== "string" ||
    typeof frequency !== "string"
  ) {
    return { error: "Initiative form is incomplete. Please try again." };
  }

  const numericAmount = Number(amount);
  const numericDueDay = Number(dueDay);
  const numericTenorMonths =
    typeof tenorMonths === "string" && tenorMonths.trim()
      ? Number(tenorMonths)
      : null;
  const numericTotalTarget =
    typeof totalTarget === "string" && totalTarget.trim()
      ? Number(totalTarget)
      : null;

  if (!name.trim()) {
    return { error: "Initiative name is required." };
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { error: "Enter a valid monthly amount." };
  }

  if (!Number.isInteger(numericDueDay) || numericDueDay < 1 || numericDueDay > 31) {
    return { error: "Due date must be a day between 1 and 31." };
  }

  await createInitiative({
    name: name.trim(),
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    amount: numericAmount,
    dueDay: numericDueDay,
    frequency,
    tenorMonths:
      numericTenorMonths && Number.isFinite(numericTenorMonths)
        ? numericTenorMonths
        : null,
    totalTarget:
      numericTotalTarget && Number.isFinite(numericTotalTarget)
        ? numericTotalTarget
        : null,
    createdByClerkUserId: userId,
  });

  revalidatePath("/admin");
  revalidatePath("/resident");

  return { success: "Initiative created successfully." };
}
