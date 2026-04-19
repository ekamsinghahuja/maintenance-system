"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { upsertResident } from "@/lib/residents";
import {
  getRole,
  isAdminEmail,
  type AppPublicMetadata,
} from "@/lib/user-metadata";

export type OnboardingState = {
  error?: string;
};

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const flatNumber = formData.get("flatNumber");

  if (typeof flatNumber !== "string" || flatNumber.trim().length < 1) {
    return { error: "Please enter your flat number." };
  }

  const normalizedFlatNumber = flatNumber.trim().toUpperCase();
  const user = await currentUser();
  const client = await clerkClient();
  const existingMetadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const emailAddress = user?.primaryEmailAddress?.emailAddress;
  const role = isAdminEmail(emailAddress) ? "admin" : getRole(existingMetadata);

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...existingMetadata,
        flatNumber: normalizedFlatNumber,
        role,
      },
    });

    await upsertResident({
      clerkUserId: userId,
      email: emailAddress ?? null,
      flatNumber: normalizedFlatNumber,
      role,
    });

    redirect(role === "admin" ? "/admin" : "/resident");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to save resident information";
    return { error: errorMessage };
  }
}
