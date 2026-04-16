import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dcfce7,_#f8fafc_55%)] px-6 py-12">
      <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-emerald-100/70 backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <section className="rounded-[1.5rem] bg-emerald-600 px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
            Resident Onboarding
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Create your account and link it to your flat.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-emerald-50/90">
            Start with Google or email, then we will ask for your flat number in
            one quick onboarding step before you enter the dashboard.
          </p>
        </section>
        <section className="flex items-center justify-center rounded-[1.5rem] bg-slate-50 p-4">
          <SignUp
            forceRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
            signInForceRedirectUrl="/onboarding"
            signInFallbackRedirectUrl="/onboarding"
          />
        </section>
      </div>
    </main>
  );
}
