import { NextResponse } from "next/server";
import { getCorsairForTenant } from "@/server/corsair";
export async function GET() {
  try {
    const corsair = getCorsairForTenant("437f6f94-b3a2-4daf-82d9-c13bb7a90759");
    const listRes = await corsair.gmail.api.messages.list({ maxResults: 1 });
    if (!listRes.messages?.length) return NextResponse.json({ error: "no msgs" });
    
    const msg = listRes.messages[0];
    const detail = await corsair.gmail.api.messages.get({
      id: msg.id!,
      format: "metadata",
      metadataHeaders: ["From", "To", "Subject", "Date"],
    });

    return NextResponse.json({ 
      headersCount: detail.payload?.headers?.length,
      headers: detail.payload?.headers 
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }); }
}
