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

