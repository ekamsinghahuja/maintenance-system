export type FlatAnalytics = {
  flatNumber: string;
  email: string | null;
  totalPaid: number;
  expectedAmount: number;
  balance: number;
  paymentCount: number;
  lastPaidAt: string | null;
};

export type InitiativeAnalytics = {
  slug: string;
  name: string;
  monthlyAmount: number;
  description: string | null;
  frequency: string;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  flatsOverdue: number;
  flatsPaid: number;
  flatsPartial: number;
};

export type ResidentCount = {
  total: number;
  withPayments: number;
  withoutPayments: number;
};

