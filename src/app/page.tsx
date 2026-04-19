import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { findResidentByClerkUserId } from "@/lib/residents";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
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

    redirect(role === "admin" ? "/admin" : "/resident");
  }

  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f8fafc_0%,_#e0f2fe_50%,_#f8fafc_100%)] px-6 py-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Maintenance Fee Manager
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Simple resident authentication for society payments
          </h1>
        </div>
      </header>

      <section className="mx-auto mt-12 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-300/70">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            Resident-first login
          </p>
          <h2 className="mt-5 text-5xl font-semibold tracking-tight">
            Collect maintenance fees with Google sign-in and flat mapping.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Each resident creates an account, confirms their flat number once,
            and then reaches a dashboard that is ready for dues, receipts, and
            payment status.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center rounded-full bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Create resident account
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
              How it works
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>1. Resident signs up using Google or email.</p>
              <p>2. Onboarding captures the flat number.</p>
              <p>3. Dashboards can now attach dues to the correct home.</p>
            </div>
          </article>
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">
              Built for next steps
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This setup is ready for payment gateways, monthly invoices, overdue
              reminders, and admin-only resident management.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
