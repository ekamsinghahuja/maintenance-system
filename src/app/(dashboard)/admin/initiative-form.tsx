"use client";

import { useActionState } from "react";
import {
  createInitiativeAction,
  type InitiativeActionState,
} from "./actions";

export type RazorpayAccountOption = {
  id: string;
  displayName: string;
};

const initialState: InitiativeActionState = {};

export function InitiativeForm({ accounts }: { accounts: RazorpayAccountOption[] }) {
  const [state, formAction, isPending] = useActionState(
    createInitiativeAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] border border-[#d7e6dc] bg-white p-6 shadow-[0_12px_40px_rgba(40,76,61,0.06)]"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#2f7a5e]">
        Create initiative
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Initiative name
          <input
            name="name"
            type="text"
            placeholder="Maintenance"
            className="h-12 rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Amount (per flat, per cycle)
          <input
            name="amount"
            type="number"
            min="1"
            step="1"
            placeholder="5000"
            className="h-12 rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Due date
          <input
            name="dueDay"
            type="number"
            min="1"
            max="31"
            placeholder="11"
            className="h-12 rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Frequency
          <select
            name="frequency"
            defaultValue="monthly"
            className="h-12 rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
          >
            {/* Daily */}
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays (Mon–Fri)</option>
            <option value="weekends">Weekends</option>

            {/* Weekly */}
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Every 2 weeks</option>

            {/* Monthly */}
            <option value="monthly">Every month</option>
            <option value="bi-monthly">Every 2 months</option>

            {/* Longer intervals */}
            <option value="quarterly">Quarterly (every 3 months)</option>
            <option value="half-yearly">Every 6 months</option>
            <option value="yearly">Yearly</option>

            {/* Custom */}
            {/* <option value="custom">Custom</option> */}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Payment Account
          <select
            name="razorpayAccountId"
            className="h-12 rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
            required
          >
            <option value="">Select a payment account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          <span className="flex items-center justify-between gap-4">
            <span>All time initiative</span>
            <input
              name="allTime"
              type="checkbox"
              value="true"
              className="h-5 w-5 rounded border border-[#d7e6dc] bg-[#f7fbf8] text-[#2f7a5e] focus:outline-none focus:ring-2 focus:ring-[#2f7a5e]"
            />
          </span>
          <span className="text-xs text-[#6b7280]">
            When enabled, this initiative continues indefinitely and tenor is not required.
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Tenor in months
          <input
            name="tenorMonths"
            type="number"
            min="1"
            placeholder="24"
            className="h-12 rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
        Description
        <textarea
          name="description"
          rows={4}
          placeholder="Explain what this collection is for and how long it will run."
          className="rounded-2xl border border-[#d7e6dc] bg-[#f7fbf8] px-4 py-3 text-base text-[#1f2937] outline-none transition focus:border-[#2f7a5e] focus:ring-4 focus:ring-[#d8eee4]"
        />
      </label>

      {state.error ? <p className="mt-4 text-sm text-[#b91c1c]">{state.error}</p> : null}
      {state.success ? (
        <p className="mt-4 text-sm text-[#166534]">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex h-12 items-center rounded-full bg-[#2f7a5e] px-6 text-sm font-semibold text-white transition hover:bg-[#235c47] disabled:cursor-not-allowed disabled:bg-[#9abdaf]"
      >
        {isPending ? "Creating..." : "Create initiative"}
      </button>
    </form>
  );
}
