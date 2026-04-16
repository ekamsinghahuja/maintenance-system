import type { PaymentEntry } from "@/lib/resident-dashboard-data";

export function PaymentHistory({ payments }: { payments: PaymentEntry[] }) {
  return (
    <section className="rounded-[1.75rem] border border-[#e8e0cf] bg-white p-5 shadow-[0_12px_40px_rgba(77,62,28,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#8d6e3b]">
            Payment history
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2937]">
            Recent credits across all projects
          </h2>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#efe8db]">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr] bg-[#faf7f1] px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b] md:grid">
          <span>Project</span>
          <span>Month</span>
          <span>Paid</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-[#efe8db]">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center"
            >
              <div>
                <p className="font-semibold text-[#1f2937]">{payment.projectName}</p>
                <p className="text-sm text-[#6b7280]">{payment.reference}</p>
              </div>
              <p className="text-sm text-[#6b7280]">{payment.monthLabel}</p>
              <p className="text-sm font-semibold text-[#1f2937]">
                Rs {payment.amount.toLocaleString("en-IN")}
              </p>
              <div>
                <span className="rounded-full bg-[#edf7f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#215b47]">
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
