"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createPayment } from "@/lib/payments";

export type PaymentActionState = {
  error?: string;
  success?: string;
};

export async function submitInitiativePayment(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Please sign in again before recording a payment." };
  }

  const initiativeSlug = formData.get("initiativeSlug");
  const initiativeName = formData.get("initiativeName");
  const flatNumber = formData.get("flatNumber");
  const amount = formData.get("amount");
  const method = formData.get("method");
  const paidForMonth = formData.get("paidForMonth");
  const reference = formData.get("reference");
  const note = formData.get("note");

  if (
    typeof initiativeSlug !== "string" ||
    typeof initiativeName !== "string" ||
    typeof flatNumber !== "string" ||
    typeof method !== "string" ||
    typeof paidForMonth !== "string"
  ) {
    return { error: "Payment form is incomplete. Please try again." };
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { error: "Enter a valid payment amount." };
  }

  await createPayment({
    clerkUserId: userId,
    flatNumber,
    initiativeSlug,
    initiativeName,
    amount: numericAmount,
    method,
    paidForMonth,
    reference: typeof reference === "string" && reference.trim() ? reference.trim() : null,
    note: typeof note === "string" && note.trim() ? note.trim() : null,
  });

  revalidatePath(`/initiative/${initiativeSlug}`);
  revalidatePath("/resident");

  return { success: "Payment recorded successfully." };
}
