"use client";

import { useEffect } from "react";

export function RedirectingPanel({
  destination,
  flatNumber,
}: {
  destination: string;
  flatNumber: string;
}) {
  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/60">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
          Redirecting
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Your account is already set up
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Taking you to the dashboard for flat {flatNumber}.
        </p>
      </div>
    </main>
  );
}
