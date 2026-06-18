import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { emailPriorities } from "@/server/db/schema/app";
import { corsairEntities } from "@/server/db/schema/corsair";
import { eq, and, desc } from "drizzle-orm";

export const dashboardRouter = router({
  getOverviewStats: protectedProcedure.query(async ({ ctx }) => {
    // 1. Fetch unread emails from our local db
    const unreadEmails = await ctx.db
      .select()
      .from(emailPriorities)
      .where(and(eq(emailPriorities.userId, ctx.userId), eq(emailPriorities.isRead, false)))
      .limit(100);

    const unreadCount = unreadEmails.length;

    // 2. Fetch calendar events from corsairEntities
    // Corsair stores Calendar events with entityType = 'Event'
    // To make this super fast, we fetch raw entities and filter them in memory for today
    // We only fetch for the current user's corsair accounts, but for now we'll fetch globally scoped to tenant if we had complex joins, 
    // but a simplified approach is to fetch Event entities. Since corsairEntities doesn't have a direct userId link without joining corsairAccounts,
    // we'll fetch all Events and parse them.
    // In a real production system, you would join corsairAccounts -> corsairIntegrations, or use a synced local table.
    // For this dashboard, we'll fetch recent Event entities.
    const rawEvents = await ctx.db
      .select({ data: corsairEntities.data })
      .from(corsairEntities)
      .where(eq(corsairEntities.entityType, "Event"))
      .limit(50);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingEvents = rawEvents
      .map((row) => row.data as any)
      .filter((evt) => {
        if (!evt?.start?.dateTime) return false;
        const evtDate = new Date(evt.start.dateTime);
        return evtDate >= new Date() && evtDate < tomorrow;
      })
      .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
      .slice(0, 3);

    return {
      unreadCount,
      upcomingEvents,
    };
  }),
});
