import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { PaymentForm } from "./payment-form";
import { findResidentByClerkUserId } from "@/lib/residents";
import {
  getResidentProjectBySlug,
} from "@/lib/resident-dashboard-data";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";

export default async function InitiativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { slug } = await params;
  const [user, resident] = await Promise.all([
    currentUser(),
    findResidentByClerkUserId(userId),
  ]);
  const metadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const flatNumber = resident?.flatNumber ?? getFlatNumber(metadata);
  const role = resident?.role ?? getRole(metadata);

  if (!flatNumber) {
    redirect("/onboarding");
  }

  if (role === "admin") {
    redirect("/admin");
  }

  const initiative = await getResidentProjectBySlug(slug, userId);

  if (!initiative) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f7f4ed_0%,_#fbfaf7_42%,_#f3efe4_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[1.75rem] border border-[#e2d8c5] bg-white/90 p-5 shadow-[0_12px_40px_rgba(77,62,28,0.06)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/resident"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8d6e3b]"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2937]">
              {initiative.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7280]">
              {initiative.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-[#e8e0cf] bg-[#faf7f1] px-4 py-2 text-sm font-medium text-[#6b7280]">
              Flat {flatNumber}
            </div>
            <UserButton />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-[#e8e0cf] bg-white p-6 shadow-[0_12px_40px_rgba(77,62,28,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#8d6e3b]">
              Initiative summary
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b]">
                  Monthly amount
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#1f2937]">
                  Rs {initiative.monthlyAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b]">
                  Due date
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#1f2937]">
                  {initiative.dueDay}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b]">
                  Paid so far
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#215b47]">
                  Rs {initiative.totalPaid.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#fcfbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8d6e3b]">
                  Extra paid
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#215b47]">
                  Rs {initiative.extraCredit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6b7280]">{initiative.timeline}</p>
          </article>

          <article className="rounded-[1.75rem] border border-[#ded5c4] bg-[#1f2937] p-6 text-white shadow-[0_20px_60px_rgba(31,41,55,0.18)]">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#d4b27a]">
              Your ledger
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b27a]">
                  Expected by now
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  Rs {initiative.expectedByNow.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b27a]">
                  Remaining balance
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  Rs {initiative.balance.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </article>
        </section>

        <PaymentForm
          initiativeSlug={initiative.slug}
          initiativeName={initiative.name}
          flatNumber={flatNumber}
          suggestedAmount={initiative.monthlyAmount}
        />

        <section className="rounded-[1.75rem] border border-[#e8e0cf] bg-white p-6 shadow-[0_12px_40px_rgba(77,62,28,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#8d6e3b]">
            Payment trail
          </p>
          <div className="mt-5 divide-y divide-[#efe8db] rounded-[1.5rem] border border-[#efe8db]">
            {initiative.payments.map((payment) => (
              <div
                key={payment.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-semibold text-[#1f2937]">{payment.monthLabel}</p>
                  <p className="text-sm text-[#6b7280]">{payment.reference}</p>
                </div>
                <p className="text-sm text-[#6b7280]">{payment.projectName}</p>
                <p className="text-sm font-semibold text-[#1f2937]">
                  Rs {payment.amount.toLocaleString("en-IN")}
                </p>
                <span className="rounded-full bg-[#edf7f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#215b47]">
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
