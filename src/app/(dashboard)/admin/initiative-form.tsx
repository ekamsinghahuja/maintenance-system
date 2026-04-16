"use client";

import { useActionState } from "react";
import {
  createInitiativeAction,
  type InitiativeActionState,
} from "./actions";

const initialState: InitiativeActionState = {};

export function InitiativeForm() {
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
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2937]">
        Configure a recurring or fixed-term collection
      </h2>

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
          Monthly amount
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
            <option value="monthly">Every month</option>
            <option value="one-time">One-time</option>
          </select>
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

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Total target
          <input
            name="totalTarget"
            type="number"
            min="1"
            placeholder="72000"
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
