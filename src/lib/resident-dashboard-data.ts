import { findInitiativeBySlug, listInitiatives, type InitiativeRecord } from "@/lib/initiatives";
import {
  listPaymentsForInitiative,
  listPaymentsForResidentInitiative,
} from "@/lib/payments";

export type ResidentProject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  frequency: string;
  monthlyAmount: number;
  dueDay: string;
  totalPaid: number;
  expectedByNow: number;
  balance: number;
  extraCredit: number;
  timeline: string;
};

export type PaymentEntry = {
  id: string;
  slug: string;
  projectName: string;
  monthLabel: string;
  amount: number;
  status: string;
  reference: string;
};

export type ResidentDashboardData = {
  thisMonthDue: number;
  totalPaid: number;
  totalOutstanding: number;
  totalExtraCredit: number;
  projects: ResidentProject[];
};

function formatFrequency(initiative: InitiativeRecord) {
  if (initiative.frequency === "monthly" && initiative.tenorMonths) {
    return `${initiative.tenorMonths}-month plan`;
  }

  if (initiative.frequency === "monthly") {
    return "Every month";
  }

  return initiative.frequency;
}

function buildTimeline(initiative: InitiativeRecord) {
  if (initiative.tenorMonths) {
    return `Runs for ${initiative.tenorMonths} months with the current billing configuration.`;
  }

  return "Active continuously until the admin closes or changes this initiative.";
}

export async function getResidentDashboardData(clerkUserId: string): Promise<ResidentDashboardData> {
  const initiatives = await listInitiatives();

  const projects = await Promise.all(
    initiatives.map(async (initiative) => {
      const residentPayments = await listPaymentsForResidentInitiative({
        clerkUserId,
        initiativeSlug: initiative.slug,
      });
      const totalPaid = residentPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const expectedByNow = initiative.amount;
      const extraCredit = Math.max(0, totalPaid - expectedByNow);
      const balance = Math.max(0, expectedByNow - totalPaid);

      return {
        id: initiative.id,
        slug: initiative.slug,
        name: initiative.name,
        description: initiative.description ?? "No description added yet.",
        frequency: formatFrequency(initiative),
        monthlyAmount: initiative.amount,
        dueDay: `${initiative.dueDay}th`,
        totalPaid,
        expectedByNow,
        balance,
        extraCredit,
        timeline: buildTimeline(initiative),
      };
    }),
  );

  return {
    thisMonthDue: projects.reduce((sum, project) => sum + project.monthlyAmount, 0),
    totalPaid: projects.reduce((sum, project) => sum + project.totalPaid, 0),
    totalOutstanding: projects.reduce((sum, project) => sum + project.balance, 0),
    totalExtraCredit: projects.reduce((sum, project) => sum + project.extraCredit, 0),
    projects,
  };
}

export async function getResidentProjectBySlug(slug: string, clerkUserId: string) {
  const [initiative, residentPayments] = await Promise.all([
    findInitiativeBySlug(slug),
    listPaymentsForResidentInitiative({
      clerkUserId,
      initiativeSlug: slug,
    }),
  ]);

  if (!initiative) {
    return null;
  }

  const totalPaid = residentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const expectedByNow = initiative.amount;

  return {
    id: initiative.id,
    slug: initiative.slug,
    name: initiative.name,
    description: initiative.description ?? "No description added yet.",
    frequency: formatFrequency(initiative),
    monthlyAmount: initiative.amount,
    dueDay: `${initiative.dueDay}th`,
    totalPaid,
    expectedByNow,
    balance: Math.max(0, expectedByNow - totalPaid),
    extraCredit: Math.max(0, totalPaid - expectedByNow),
    timeline: buildTimeline(initiative),
    payments: residentPayments.map((payment) => ({
      id: payment.id,
      slug: payment.initiativeSlug,
      projectName: payment.initiativeName,
      monthLabel: payment.paidForMonth,
      amount: payment.amount,
      status: payment.status,
      reference:
        payment.reference ?? `${payment.method}${payment.note ? ` • ${payment.note}` : ""}`,
    })),
  };
}

export async function getAdminInitiativeDetail(slug: string) {
  const initiative = await findInitiativeBySlug(slug);

  if (!initiative) {
    return null;
  }

  const payments = await listPaymentsForInitiative(slug);
  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    initiative,
    totalCollected,
  };
}
