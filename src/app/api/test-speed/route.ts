import { NextResponse } from "next/server";
import { getCorsairForTenant } from "@/server/corsair";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const start = Date.now();
  try {
    const allUsers = await db.query.users.findMany();
    const firstUser = allUsers[0];
    if (!firstUser) return NextResponse.json({ error: "No users found" }, { status: 400 });

    // Measure DB Token Fetch Time
    const dbStart = Date.now();
    await db.query.accounts.findFirst({
      where: eq(accounts.userId, firstUser.id)
    });
    const dbTimeMs = Date.now() - dbStart;

    const corsair = getCorsairForTenant(firstUser.id);
    
    // Measure Corsair List
    const listStart = Date.now();
    await corsair.gmail.api.messages.list({ maxResults: 10, labelIds: ["INBOX"] });
    const listTime = Date.now() - listStart;

    return NextResponse.json({ 
      success: true, 
      dbTokenFetchTimeMs: dbTimeMs,
      corsairListTimeMs: listTime,
      totalTimeMs: Date.now() - start
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
