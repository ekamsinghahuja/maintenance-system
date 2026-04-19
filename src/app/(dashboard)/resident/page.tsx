import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/resident/dashboard-shell";
import { ProjectTabs } from "@/components/resident/project-tabs";
import { SidebarSummary } from "@/components/resident/sidebar-summary";
import { StatCard } from "@/components/resident/stat-card";
import { findResidentByClerkUserId } from "@/lib/residents";
import { getResidentDashboardData } from "@/lib/resident-dashboard-data";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";

export default async function ResidentDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const metadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const resident = await findResidentByClerkUserId(userId);
  const flatNumber = resident?.flatNumber ?? getFlatNumber(metadata);
  const role = resident?.role ?? getRole(metadata);

  if (!flatNumber) {
    redirect("/onboarding");
  }

  if (role === "admin") {
    redirect("/admin");
  }

  const residentName =
    user?.firstName?.trim() || user?.fullName?.trim() || "Resident";
  const dashboardData = await getResidentDashboardData(userId);

  return (
    <DashboardShell
      header={
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[#e2d8c5] bg-white/90 p-5 shadow-[0_12px_40px_rgba(77,62,28,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8d6e3b]">
              Resident dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2937]">
              Collections for Flat {flatNumber}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-[#e8e0cf] bg-[#faf7f1] px-4 py-2 text-sm font-medium text-[#6b7280]">
              Updated for April 2026
            </div>
            <UserButton />
          </div>
        </div>
      }
      sidebar={
        <SidebarSummary
          flatNumber={flatNumber}
          residentName={residentName}
          data={dashboardData}
        />
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="This month"
          value={`Rs ${dashboardData.thisMonthDue.toLocaleString("en-IN")}`}
          note="Combined due for active projects scheduled on the 11th."
          accent="sand"
        />
        <StatCard
          label="Total paid"
          value={`Rs ${dashboardData.totalPaid.toLocaleString("en-IN")}`}
          note="Cumulative amount credited to your resident ledger so far."
          accent="mint"
        />
        <StatCard
          label="Outstanding"
          value={`Rs ${dashboardData.totalOutstanding.toLocaleString("en-IN")}`}
          note="Amount still pending after adjusting any advance or extra payments."
          accent="ink"
        />
      </section>

      <ProjectTabs projects={dashboardData.projects} />
    </DashboardShell>
  );
}
