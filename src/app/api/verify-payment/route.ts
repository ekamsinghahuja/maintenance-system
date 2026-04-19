// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAccountForInitiative, getAccountById } from "@/lib/accounts";
import { createPayment } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      initiative,
      accountId,
      clerkUserId,
      flatNumber,
      initiativeName,
      amount,
      paidForMonth,
      note,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Get the account - try accountId first, then fall back to initiative lookup
    let account = null;
    if (accountId) {
      account = getAccountById(accountId);
    }
    if (!account && initiative) {
      account = await getAccountForInitiative(initiative);
    }

    if (!account?.key_secret) {
      return NextResponse.json(
        { error: "No payment account found" },
        { status: 400 }
      );
    }

    // Verify the signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", account.key_secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature verification failed:", {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await createPayment({
      clerkUserId,
      flatNumber,
      initiativeSlug: initiative,
      initiativeName,
      amount,
      method: "razorpay",
      paidForMonth,
      reference: razorpay_payment_id,
      note: note || null,
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
