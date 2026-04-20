import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { findResidentByClerkUserId } from "@/lib/residents";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";
import { findInitiativeBySlug } from "@/lib/initiatives";
import { getFlatWiseAnalytics } from "@/lib/analytics";

export default async function InitiativeAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [user, resident, { slug }] = await Promise.all([
    currentUser(),
    findResidentByClerkUserId(userId),
    params,
  ]);

  const metadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const role = resident?.role ?? getRole(metadata);
  const flatNumber = resident?.flatNumber ?? getFlatNumber(metadata);

  if (!flatNumber || role !== "admin") {
    redirect("/admin");
  }

  const initiative = await findInitiativeBySlug(slug);

  if (!initiative) {
    notFound();
  }

  const flatAnalytics = await getFlatWiseAnalytics(slug);

  // Calculate summary stats
  const totalPaid = Math.round(
    flatAnalytics.reduce((sum, f) => sum + Number(f.totalPaid), 0) * 100
  ) / 100;
  const totalExpected = Math.round(
    flatAnalytics.reduce((sum, f) => sum + Number(f.expectedAmount), 0) * 100
  ) / 100;
  const totalBalance = Math.round(
    flatAnalytics.reduce((sum, f) => sum + Number(f.balance), 0) * 100
  ) / 100;
  const flatsInCredit = flatAnalytics.filter(
    (f) => f.totalPaid > f.expectedAmount,
  ).length;
  const flatsInDebit = flatAnalytics.filter((f) => f.balance > 0).length;
  const flatsPaid = flatAnalytics.filter(
    (f) => f.totalPaid >= f.expectedAmount,
  ).length;

  const cellClass = "px-4 py-3";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef8f2_0%,#f8fbf8_42%,#eef6f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/analytics"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f7a5e]"
            >
              Back to analytics
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2937]">
              {initiative.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
              {initiative.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-[#d7e6dc] bg-[#f7fbf8] px-4 py-2 text-sm font-medium text-[#6b7280]">
              {initiative.frequency}
            </div>
            <UserButton />
          </div>
        </header>

        {/* Summary Cards */}
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Total Expected
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#1f2937]">
              Rs {totalExpected.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[#6b7280]">across {flatAnalytics.length} flats</p>
          </article>

          <article className="rounded-3xl border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Total Collected
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#215b47]">
              Rs {totalPaid.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[#6b7280]">
              {((totalPaid / totalExpected) * 100).toFixed(1)}% collection
            </p>
          </article>

          <article className="rounded-3xl border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Outstanding Balance
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#b91c1c]">
              Rs {totalBalance.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[#6b7280]">{flatsInDebit} flats in debit</p>
          </article>

          <article className="rounded-3xl border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Extra Credit
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#215b47]">
              Rs{" "}
              {flatAnalytics
                .filter((f) => f.totalPaid > f.expectedAmount)
                .reduce((sum, f) => sum + (f.totalPaid - f.expectedAmount), 0)
                .toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[#6b7280]">{flatsInCredit} flats overpaid</p>
          </article>
        </section>

        {/* Flat-wise Table */}
        <section className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
            Flat-wise Status
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e7efe9] text-left">
                  <th className={`${cellClass} font-semibold text-[#2f7a5e]`}>Flat</th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e]`}>Email</th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e] text-right`}>
                    Expected
                  </th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e] text-right`}>Paid</th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e] text-right`}>
                    Balance
                  </th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e]`}>Status</th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e]`}>Count</th>
                  <th className={`${cellClass} font-semibold text-[#2f7a5e]`}>Last Paid</th>
                </tr>
              </thead>
              <tbody>
                {flatAnalytics
                  .sort((a, b) => {
                    // Sort by balance (debit first), then by flat number
                    if (a.balance !== b.balance) {
                      return b.balance - a.balance;
                    }
                    return a.flatNumber.localeCompare(b.flatNumber);
                  })
                  .map((flat) => {
                    const isCredited = flat.totalPaid > flat.expectedAmount;
                    const isPartialPaid =
                      flat.totalPaid > 0 && flat.totalPaid < flat.expectedAmount;
                    const isUnpaid = flat.totalPaid === 0;

                    return (
                      <tr
                        key={flat.flatNumber}
                        className="border-b border-[#e7efe9] hover:bg-[#f7fbf8]"
                      >
                        <td className={`${cellClass} font-semibold text-[#1f2937]`}>
                          {flat.flatNumber}
                        </td>
                        <td className={`${cellClass} text-[#6b7280]`}>
                          {flat.email || "N/A"}
                        </td>
                        <td className={`${cellClass} text-right text-[#6b7280]`}>
                          Rs {flat.expectedAmount.toLocaleString("en-IN")}
                        </td>
                        <td className={`${cellClass} text-right font-semibold text-[#215b47]`}>
                          Rs {flat.totalPaid.toLocaleString("en-IN")}
                        </td>
                        <td
                          className={`${cellClass} text-right font-semibold ${
                            isCredited
                              ? "text-[#215b47]"
                              : flat.balance > 0
                                ? "text-[#b91c1c]"
                                : "text-[#6b7280]"
                          }`}
                        >
                          {isCredited ? "+" : ""}Rs {Math.abs(flat.balance).toLocaleString("en-IN")}
                        </td>
                        <td className={cellClass}>
                          {isCredited && (
                            <span className="rounded-full bg-[#edf7f2] px-3 py-1 text-xs font-semibold text-[#215b47]">
                              Credit
                            </span>
                          )}
                          {isPartialPaid && (
                            <span className="rounded-full bg-[#fef3f2] px-3 py-1 text-xs font-semibold text-[#d97706]">
                              Partial
                            </span>
                          )}
                          {isUnpaid && (
                            <span className="rounded-full bg-[#fee2e2] px-3 py-1 text-xs font-semibold text-[#b91c1c]">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className={`${cellClass} text-[#6b7280]`}>
                          {flat.paymentCount} payment{flat.paymentCount !== 1 ? "s" : ""}
                        </td>
                        <td className={`${cellClass} text-xs text-[#6b7280]`}>
                          {flat.lastPaidAt
                            ? new Date(flat.lastPaidAt).toLocaleDateString("en-IN")
                            : "Never"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
