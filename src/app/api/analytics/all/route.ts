import { listInitiatives } from "@/lib/initiatives";
import { getFlatWiseAnalytics } from "@/lib/analytics";
import { NextResponse } from "next/server";

type FlatAnalyticsRow = {
  flatNumber: string;
  initiativeName: string;
  initiativeSlug: string;
  paid: number;
  expected: number;
  balance: number;
  paymentCount: number;
  lastPaidAt: string | null;
  email: string | null;
};

export async function GET() {
  try {
    const initiatives = await listInitiatives();
    const allData: FlatAnalyticsRow[] = [];

    // Fetch flats for each initiative
    for (const initiative of initiatives) {
      const flatAnalytics = await getFlatWiseAnalytics(initiative.slug);

      for (const flat of flatAnalytics) {
        allData.push({
          flatNumber: flat.flatNumber,
          initiativeName: initiative.name,
          initiativeSlug: initiative.slug,
          paid: flat.totalPaid,
          expected: flat.expectedAmount,
          balance: flat.balance,
          paymentCount: flat.paymentCount,
          lastPaidAt: flat.lastPaidAt,
          email: flat.email,
        });
      }
    }

    // Sort by flat number, then by initiative
    allData.sort((a, b) => {
      if (a.flatNumber !== b.flatNumber) {
        return a.flatNumber.localeCompare(b.flatNumber);
      }
      return a.initiativeName.localeCompare(b.initiativeName);
    });

    return NextResponse.json(allData);
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
