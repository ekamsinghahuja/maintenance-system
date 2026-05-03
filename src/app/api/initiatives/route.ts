import { listInitiatives } from "@/lib/initiatives";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const initiatives = await listInitiatives();
    return NextResponse.json(
      initiatives.map((init) => ({
        slug: init.slug,
        name: init.name,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch initiatives:", error);
    return NextResponse.json({ error: "Failed to fetch initiatives" }, { status: 500 });
  }
}
