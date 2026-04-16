"use client";

import { useActionState } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";

const initialState: OnboardingState = {};

export function FlatNumberForm({ defaultValue }: { defaultValue: string }) {
  const [state, formAction, isPending] = useActionState(
    completeOnboarding,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="flatNumber" className="text-sm font-medium text-slate-700">
          Flat number
        </label>
        <input
          id="flatNumber"
          name="flatNumber"
          type="text"
          required
          defaultValue={defaultValue}
          placeholder="A-302"
          className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPending ? "Saving..." : "Continue to dashboard"}
      </button>
    </form>
  );
}
