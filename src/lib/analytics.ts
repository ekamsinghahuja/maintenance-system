import { getDb } from "@/lib/db";
import { listInitiatives, findInitiativeBySlug } from "@/lib/initiatives";
import { listResidentPaymentStatusForInitiative } from "@/lib/payments";

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
  collectionRate: number; // percentage
  flatsOverdue: number;
  flatsPaid: number;
  flatsPartial: number;
};

export type ResidentCount = {
  total: number;
  withPayments: number;
  withoutPayments: number;
};

// Helper function to calculate expected payment amount for an initiative
function calculateExpectedAmount(
  initiative: { amount: number; frequency: string; startDate: string; tenorMonths: number | null },
  currentDate: Date = new Date()
): number {
  const startDate = new Date(initiative.startDate);
  const endDate = initiative.tenorMonths
    ? new Date(startDate.getTime() + initiative.tenorMonths * 30 * 24 * 60 * 60 * 1000) // Approximate months
    : null;

  // If end date has passed, no more collection
  if (endDate && currentDate > endDate) {
    return 0;
  }

  const frequency = initiative.frequency.toLowerCase();
  const monthsDiff = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
  );

  switch (frequency) {
    case 'monthly':
      return Math.max(0, monthsDiff + 1) * initiative.amount; // +1 to include current month
    case 'quarterly':
      return Math.max(0, Math.floor(monthsDiff / 3) + 1) * initiative.amount;
    case 'half-yearly':
    case 'semi-annually':
      return Math.max(0, Math.floor(monthsDiff / 6) + 1) * initiative.amount;
    case 'yearly':
    case 'annually':
      return Math.max(0, Math.floor(monthsDiff / 12) + 1) * initiative.amount;
    case 'one-time':
      return startDate <= currentDate ? initiative.amount : 0;
    default:
      return 0;
  }
}

export async function getFlatWiseAnalytics(
  initiativeSlug: string,
): Promise<FlatAnalytics[]> {
  const statusData = await listResidentPaymentStatusForInitiative(initiativeSlug);
  const initiative = await findInitiativeBySlug(initiativeSlug);

  if (!initiative) {
    return [];
  }

  return statusData.map((item) => {
    const expectedAmount = calculateExpectedAmount(initiative);

    return {
      flatNumber: item.flatNumber,
      email: item.email,
      totalPaid: Number(item.paidTotal || 0),
      expectedAmount,
      balance: Math.max(0, expectedAmount - Number(item.paidTotal || 0)),
      paymentCount: Number(item.paymentCount || 0),
      lastPaidAt: item.lastPaidAt,
    };
  });
}

export async function getAllInitiativesAnalytics(): Promise<InitiativeAnalytics[]> {
  const initiatives = await listInitiatives();

  const analytics = await Promise.all(
    initiatives.map(async (initiative) => {
      const statusData = await listResidentPaymentStatusForInitiative(
        initiative.slug,
      );
      
      const expectedAmountPerFlat = calculateExpectedAmount(initiative);

      const totalCollected = statusData.reduce(
        (sum, item) => sum + Number(item.paidTotal || 0),
        0,
      );

      // Count residents by payment status
      const flatsWithPayments = statusData.filter(
        (item) => Number(item.paidTotal || 0) > 0,
      ).length;
      const flatsPaid = statusData.filter(
        (item) => Number(item.paidTotal || 0) >= expectedAmountPerFlat,
      ).length;
      const flatsPartial = flatsWithPayments - flatsPaid;
      const flatsOverdue = statusData.length - flatsWithPayments;

      const totalResidents = statusData.length;
      const totalExpected = totalResidents * expectedAmountPerFlat;
      const collectionRate =
        totalResidents > 0 ? (totalCollected / totalExpected) * 100 : 0;

      return {
        slug: initiative.slug,
        name: initiative.name,
        monthlyAmount: Number(initiative.amount),
        description: initiative.description,
        frequency: initiative.frequency,
        totalExpected,
        totalCollected,
        collectionRate: Math.round(collectionRate * 100) / 100,
        flatsOverdue,
        flatsPaid,
        flatsPartial,
      };
    }),
  );

  return analytics;
}

export async function getResidentCountByInitiative(
  initiativeSlug: string,
): Promise<ResidentCount> {
  const statusData = await listResidentPaymentStatusForInitiative(
    initiativeSlug,
  );

  const withPayments = statusData.filter(
    (item) => Number(item.paidTotal || 0) > 0,
  ).length;

  return {
    total: statusData.length,
    withPayments,
    withoutPayments: statusData.length - withPayments,
  };
}
