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

