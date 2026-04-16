import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FlatNumberForm } from "./flat-number-form";
import { RedirectingPanel } from "./redirecting-panel";
import { getFlatNumber, getRole, type AppPublicMetadata } from "@/lib/user-metadata";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const metadata = (user?.publicMetadata ?? {}) as AppPublicMetadata;
  const flatNumber = getFlatNumber(metadata);
  const role = getRole(metadata);

  if (flatNumber) {
    return (
      <RedirectingPanel
        destination={role === "admin" ? "/admin" : "/resident"}
        flatNumber={flatNumber}
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
          Step 2 of 2
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Finish your resident profile
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          You are signed in. Add your flat number so we can connect payments,
          dues, and receipts to the correct home.
        </p>
        <FlatNumberForm defaultValue={flatNumber} />
      </div>
    </main>
  );
}
