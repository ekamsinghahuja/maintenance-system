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

