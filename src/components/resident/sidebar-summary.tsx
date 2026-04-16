import type { ResidentDashboardData } from "@/lib/resident-dashboard-data";

export function SidebarSummary({
  flatNumber,
  residentName,
  data,
}: {
  flatNumber: string;
  residentName: string;
  data: ResidentDashboardData;
}) {
  return (
    <aside className="flex h-fit flex-col gap-4 rounded-[1.75rem] border border-[#ded5c4] bg-[#1f2937] p-5 text-white shadow-[0_20px_60px_rgba(31,41,55,0.18)]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d4b27a]">
          Resident account
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{residentName}</h2>
        <p className="mt-2 text-sm text-slate-300">Flat {flatNumber}</p>
      </div>

      <div className="rounded-[1.5rem] bg-white/8 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b27a]">
          Total due this month
        </p>
        <p className="mt-2 text-3xl font-semibold">
          Rs {data.thisMonthDue.toLocaleString("en-IN")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Combined amount for all active projects due this cycle.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-white/8 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4b27a]">
          Credit available
        </p>
        <p className="mt-2 text-3xl font-semibold text-[#9fe0cb]">
          Rs {data.totalExtraCredit.toLocaleString("en-IN")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Any extra amount paid stays tracked here and offsets future dues.
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-[#f5ecd9] p-4 text-[#3a2f1c]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b]">
          Current rules
        </p>
        <ul className="mt-3 space-y-3 text-sm leading-6">
          <li>Maintenance is due on the 11th of each month.</li>
          <li>Construction fund continues for 24 months.</li>
          <li>Overpayments are preserved as credit, not lost.</li>
        </ul>
      </div>
    </aside>
  );
}
