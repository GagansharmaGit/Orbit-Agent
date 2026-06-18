import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers);

    // Process webhook through Corsair
    const { processWebhook } = await import("corsair");
    const result = await processWebhook(corsair, headers, body);

    console.log(`[Webhook] Processed`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
