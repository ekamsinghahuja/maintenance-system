"use client";

import { useActionState } from "react";
import {
  submitInitiativePayment,
  type PaymentActionState,
} from "./actions";

const initialState: PaymentActionState = {};

export function PaymentForm({
  initiativeSlug,
  initiativeName,
  flatNumber,
  suggestedAmount,
}: {
  initiativeSlug: string;
  initiativeName: string;
  flatNumber: string;
  suggestedAmount: number;
}) {
  const [state, formAction, isPending] = useActionState(
    submitInitiativePayment,
    initialState,
  );

  const now = new Date();
  const monthValue = `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] border border-[#e8e0cf] bg-white p-6 shadow-[0_12px_40px_rgba(77,62,28,0.06)]"
    >
      <input type="hidden" name="initiativeSlug" value={initiativeSlug} />
      <input type="hidden" name="initiativeName" value={initiativeName} />
      <input type="hidden" name="flatNumber" value={flatNumber} />

      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#8d6e3b]">
        Record payment
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2937]">
        Add a payment for this initiative
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Amount
          <input
            name="amount"
            type="number"
            min="1"
            step="1"
            defaultValue={suggestedAmount}
            className="h-12 rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Paid for month
          <input
            name="paidForMonth"
            type="text"
            defaultValue={monthValue}
            className="h-12 rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Method
          <select
            name="method"
            defaultValue="UPI"
            className="h-12 rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
          >
            <option value="UPI">UPI</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Reference
          <input
            name="reference"
            type="text"
            placeholder="UPI ref / bank ref / receipt no."
            className="h-12 rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
        Note
        <textarea
          name="note"
          rows={4}
          placeholder="Optional note for extra payment, advance payment, or adjustment."
          className="rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 py-3 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
        />
      </label>

      {state.error ? (
        <p className="mt-4 text-sm font-medium text-[#b91c1c]">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="mt-4 text-sm font-medium text-[#166534]">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex h-12 items-center rounded-full bg-[#215b47] px-6 text-sm font-semibold text-white transition hover:bg-[#184737] disabled:cursor-not-allowed disabled:bg-[#98b7aa]"
      >
        {isPending ? "Saving payment..." : "Save payment"}
      </button>
    </form>
  );
}
