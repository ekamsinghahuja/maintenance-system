import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { findInitiativeBySlug } from "@/lib/initiatives";
import {
  listPaymentsForInitiative,
  listResidentPaymentStatusForInitiative,
} from "@/lib/payments";
import { findResidentByClerkUserId } from "@/lib/residents";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";

export default async function AdminInitiativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const metadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const resident = await findResidentByClerkUserId(userId);
  const role = resident?.role ?? getRole(metadata);
  const flatNumber = resident?.flatNumber ?? getFlatNumber(metadata);

  if (!flatNumber) {
    redirect("/onboarding");
  }

  if (role !== "admin") {
    redirect("/resident");
  }

  const { slug } = await params;
  const initiative = await findInitiativeBySlug(slug);

  if (!initiative) {
    notFound();
  }

  const payments = await listPaymentsForInitiative(slug);
  const residentStatus = await listResidentPaymentStatusForInitiative(slug);
  const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eef8f2_0%,_#f8fbf8_42%,_#eef6f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2f7a5e]"
            >
              Back to admin dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2937]">
              {initiative.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
              {initiative.description ?? "No description yet."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-[#d7e6dc] bg-[#f7fbf8] px-4 py-2 text-sm font-medium text-[#6b7280]">
              Due on {initiative.dueDay}
            </div>
            <UserButton />
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-4">
          <article className="rounded-[1.5rem] border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Monthly amount
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#1f2937]">
              Rs {initiative.amount.toLocaleString("en-IN")}
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Total collected
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#1f2937]">
              Rs {totalCollected.toLocaleString("en-IN")}
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Resident payments
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#1f2937]">{payments.length}</p>
          </article>
          <article className="rounded-[1.5rem] border border-[#d7e6dc] bg-white p-5 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f7a5e]">
              Tenor
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#1f2937]">
              {initiative.tenorMonths ? `${initiative.tenorMonths} mo` : "Open"}
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <article className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
              Flat-wise status
            </p>
            <div className="mt-5 divide-y divide-[#e7efe9] rounded-[1.5rem] border border-[#e7efe9]">
              {residentStatus.map((item) => (
                <div
                  key={item.clerkUserId}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[0.8fr_1.2fr_0.7fr_0.8fr] md:items-center"
                >
                  <div>
                    <p className="font-semibold text-[#1f2937]">{item.flatNumber}</p>
                  </div>
                  <p className="text-sm text-[#6b7280]">{item.email ?? "No email saved"}</p>
                  <p className="text-sm font-semibold text-[#1f2937]">
                    Rs {item.paidTotal.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {item.paymentCount > 0 ? `${item.paymentCount} payments` : "No payment yet"}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
              Latest activity
            </p>
            <div className="mt-5 divide-y divide-[#e7efe9] rounded-[1.5rem] border border-[#e7efe9]">
              {payments.length === 0 ? (
                <div className="px-5 py-6 text-sm text-[#6b7280]">
                  No payments recorded for this initiative yet.
                </div>
              ) : null}
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid gap-2 px-5 py-4 md:grid-cols-[0.8fr_0.8fr_0.8fr_auto]"
                >
                  <p className="font-semibold text-[#1f2937]">{payment.flatNumber}</p>
                  <p className="text-sm text-[#6b7280]">{payment.paidForMonth}</p>
                  <p className="text-sm font-semibold text-[#1f2937]">
                    Rs {payment.amount.toLocaleString("en-IN")}
                  </p>
                  <span className="rounded-full bg-[#e5f3eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7a5e]">
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
