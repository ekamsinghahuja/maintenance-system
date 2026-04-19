"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface RazorpayInstance {
  open(): void;
  close(): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

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
  const { userId } = useAuth();
  const [amount, setAmount] = useState(suggestedAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [paidForMonth, setPaidForMonth] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;
  });

  const handlePayment = async () => {
    if (!userId) {
      setError("Please sign in first");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Create order
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiative: initiativeSlug,
          amount: amount,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const { order, key_id, accountId } = orderData;

      // Step 2: Load Razorpay SDK
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        const options: RazorpayOptions = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: "RWA Maintenance",
          description: `${initiativeName} - Flat ${flatNumber}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              // Step 3: Verify payment
              const verifyResponse = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  initiative: initiativeSlug,
                  accountId: accountId,
                  clerkUserId: userId,
                  flatNumber: flatNumber,
                  initiativeName: initiativeName,
                  amount: amount,
                  paidForMonth: paidForMonth,
                  note: null,
                }),
              });

              if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.error || "Payment verification failed");
              }

              setSuccess(`Payment of Rs ${amount} recorded successfully!`);
              setAmount(suggestedAmount);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Payment verification failed");
              setIsLoading(false);
            }
          },
          prefill: {
            email: "",
            contact: "",
          },
          theme: {
            color: "#1f7a4a",
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      document.head.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-[#e8e0cf] bg-white p-6 shadow-[0_12px_40px_rgba(77,62,28,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#8d6e3b]">
        Pay with Razorpay
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2937]">
        Add a payment for this initiative
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Amount (Rs)
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-12 rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
            disabled={isLoading}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-[#4b5563]">
          Paid for month
          <input
            type="text"
            value={paidForMonth}
            onChange={(e) => setPaidForMonth(e.target.value)}
            className="h-12 rounded-2xl border border-[#d9cfbc] bg-[#fcfbf8] px-4 text-base text-[#1f2937] outline-none transition focus:border-[#8d6e3b] focus:ring-4 focus:ring-[#efe2c6]"
            disabled={isLoading}
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-3xl border border-[#fee2e2] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-3xl border border-[#dcfce7] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
          {success}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isLoading || amount <= 0}
        className="mt-6 inline-flex h-12 items-center rounded-full bg-[#2f7a5e] px-8 text-sm font-semibold text-white transition hover:bg-[#235c47] disabled:cursor-not-allowed disabled:bg-[#9abdaf]"
      >
        {isLoading ? "Processing..." : `Pay Rs ${amount.toLocaleString("en-IN")}`}
      </button>
    </section>
  );
}
