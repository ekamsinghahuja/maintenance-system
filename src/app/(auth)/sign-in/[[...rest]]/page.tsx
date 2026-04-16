import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_55%)] px-6 py-12">
      <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <section className="rounded-[1.5rem] bg-slate-950 px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            Maintenance Fee Manager
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Sign in to manage building dues and payment updates.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
            Residents can continue with Google and then confirm their flat number.
            Admins can use the same login and get routed by role after onboarding.
          </p>
        </section>
        <section className="flex items-center justify-center rounded-[1.5rem] bg-slate-50 p-4">
          <SignIn
            forceRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
            signUpForceRedirectUrl="/onboarding"
            signUpFallbackRedirectUrl="/onboarding"
          />
        </section>
      </div>
    </main>
  );
}
