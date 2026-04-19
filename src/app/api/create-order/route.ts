// app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getInstance } from "@/lib/razorpay";
import { getAccountForInitiative } from "@/lib/accounts";

export async function POST(req: NextRequest) {
  try {
    const { initiative, amount } = await req.json();

    if (!initiative || !amount) {
      return NextResponse.json(
        { error: "Initiative and amount are required" },
        { status: 400 }
      );
    }

    const account = await getAccountForInitiative(initiative);

    if (!account) {
      return NextResponse.json(
        { error: "No payment account configured for this initiative" },
        { status: 400 }
      );
    }

    if (!account.key_id || !account.key_secret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const razorpay = getInstance(account.key_id, account.key_secret);

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        initiative,
        accountId: account.id,
      },
    });

    return NextResponse.json({
      order,
      key_id: account.key_id, // send to frontend
      accountId: account.id,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}