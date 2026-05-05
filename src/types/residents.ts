import type { AppUserRole } from "@/types/auth";

export type ResidentRecord = {
  id: number;
  clerkUserId: string;
  email: string | null;
  flatNumber: string;
  role: AppUserRole;
  createdAt: string;
  updatedAt: string;
};

