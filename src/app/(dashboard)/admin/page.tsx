import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InitiativeForm } from "./initiative-form";
import { listInitiatives } from "@/lib/initiatives";
import { listPaymentsForInitiative } from "@/lib/payments";
import { findResidentByClerkUserId } from "@/lib/residents";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";
import { getAllAccounts } from "@/lib/accounts";

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [user, resident] = await Promise.all([
    currentUser(),
    findResidentByClerkUserId(userId),
  ]);
  const metadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const role = resident?.role ?? getRole(metadata);
  const flatNumber = resident?.flatNumber ?? getFlatNumber(metadata);

  if (!flatNumber) {
    redirect("/onboarding");
  }

  if (role !== "admin") {
    redirect("/resident");
  }

  const initiatives = await listInitiatives();
  const initiativeCards = await Promise.all(
    initiatives.map(async (initiative) => {
      const payments = await listPaymentsForInitiative(initiative.slug);
      return {
        ...initiative,
        paymentsCount: payments.length,
        totalCollected: payments.reduce((sum, payment) => sum + payment.amount, 0),
      };
    }),
  );

  // Get all available Razorpay accounts
  const allAccounts = getAllAccounts();
  const accountsList = Object.values(allAccounts).map((account) => ({
    id: account.id,
    displayName: account.display_name || account.id,
  }));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eef8f2_0%,_#f8fbf8_42%,_#eef6f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2f7a5e]">
              Admin dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-[#d7e6dc] bg-[#f7fbf8] px-4 py-2 text-sm font-medium text-[#6b7280]">
              Admin RWA
            </div>
            <UserButton />
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_550px]">
          <section className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
                  Current initiatives
                </p>
              </div>
              <div className="rounded-full bg-[#f0f8f4] px-4 py-2 text-sm font-medium text-[#2f7a5e]">
                {initiativeCards.length} active
              </div>
            </div>

            <div className="mt-6 max-h-140 overflow-y-auto">
              <div className="space-y-4 pr-2">
              {initiativeCards.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-[#c7d9ce] bg-[#f7fbf8] p-6 text-sm leading-7 text-[#6b7280]">
                  No initiatives yet. Create one from the panel on the right to start
                  collecting from residents.
                </div>
              ) : null}

              {initiativeCards.map((initiative) => (
                <Link
                  key={initiative.id}
                  href={`/admin/initiative/${initiative.slug}`}
                  className="grid gap-4 rounded-[1.5rem] border border-[#dfebe4] bg-[#fbfdfb] p-5 transition hover:border-[#9abdaf] hover:shadow-[0_18px_45px_rgba(40,76,61,0.08)] md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.5fr))]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-[#1f2937]">
                        {initiative.name}
                      </h3>
                      <span className="rounded-full bg-[#e5f3eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
                        {initiative.frequency === "monthly" ? "Recurring" : "One-time"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                      {initiative.description ?? "No description yet."}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7a5e]">
                      Amount
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1f2937]">
                      Rs {initiative.amount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7a5e]">
                      Due day
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1f2937]">
                      {initiative.dueDay}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7a5e]">
                      Payments
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1f2937]">
                      {initiative.paymentsCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7a5e]">
                      Collected
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1f2937]">
                      Rs {initiative.totalCollected.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            </div>
          </section>

          <InitiativeForm accounts={accountsList} />
        </div>
      </div>
    </main>
  );
}
