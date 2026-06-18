import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { getCorsairForTenant } from "@/server/corsair";
import { getCalendarClient } from "@/server/google";

export const calendarRouter = router({
  // List events for a date range
  listEvents: protectedProcedure
    .input(
      z.object({
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
        maxResults: z.number().optional().default(250),
        calendarId: z.string().optional().default("primary"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        return getMockEvents();
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);
        const res = await corsair.googlecalendar.api.events.getMany({
          calendarId: input.calendarId,
          timeMin: input.timeMin || new Date().toISOString(),
          timeMax: input.timeMax,
          maxResults: input.maxResults,
          singleEvents: true,
          orderBy: "startTime",
        });

        return {
          items: (res.items || [])
            .filter((evt) => evt.status !== "cancelled")
            .map((evt) => ({
              id: evt.id!,
              summary: evt.summary || "(No title)",
              description: evt.description || "",
              start: evt.start || {},
              end: evt.end || {},
              attendees: evt.attendees || [],
              location: evt.location || "",
              status: evt.status || "confirmed",
              colorId: evt.colorId,
              htmlLink: evt.htmlLink,
              hangoutLink: evt.hangoutLink,
              creator: evt.creator,
              organizer: evt.organizer,
            })),
          nextPageToken: res.nextPageToken,
        };
      } catch (error: any) {
        console.error("[Calendar] List error:", error?.message);
        return getMockEvents();
      }
    }),

  // Get single event
  getEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        calendarId: z.string().optional().default("primary"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        return getMockEvents().items[0];
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);
        const res = await corsair.googlecalendar.api.events.get({
          calendarId: input.calendarId,
          id: input.eventId,
        });
        return res;
      } catch (error: any) {
        console.error("[Calendar] Get error:", error?.message);
        return null;
      }
    }),

  // Create event
  createEvent: protectedProcedure
    .input(
      z.object({
        summary: z.string(),
        description: z.string().optional(),
        startDateTime: z.string(),
        endDateTime: z.string(),
        attendees: z.array(z.string()).optional(),
        location: z.string().optional(),
        calendarId: z.string().optional().default("primary"),
        sendNotifications: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        return { id: "mock_event_" + Date.now(), summary: input.summary, status: "confirmed" };
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);
        const res = await corsair.googlecalendar.api.events.create({
          calendarId: input.calendarId,
          sendUpdates: input.sendNotifications ? "all" : "none",
          event: {
            summary: input.summary,
            description: input.description,
            start: { dateTime: input.startDateTime },
            end: { dateTime: input.endDateTime },
            attendees: input.attendees?.map((email) => ({ email })),
            location: input.location,
          },
        });

        // "Fetch link using Google": We patch the newly created Corsair event with the Google SDK just to add the Meet link
        const cal = getCalendarClient(ctx.accessToken, ctx.refreshToken);
        const patchedRes = await cal.events.patch({
          calendarId: input.calendarId,
          eventId: res.id!,
          conferenceDataVersion: 1,
          requestBody: {
            conferenceData: {
              createRequest: {
                requestId: crypto.randomUUID(),
                conferenceSolutionKey: { type: "hangoutsMeet" }
              }
            }
          }
        });

        return patchedRes.data;
      } catch (error: any) {
        console.error("[Calendar] Create error:", error?.message);
        throw new Error("Failed to create event: " + error?.message);
      }
    }),

  // Quick invite — the key 1-step workflow
  quickInvite: protectedProcedure
    .input(
      z.object({
        emails: z.string(),
        dateTime: z.string(),
        duration: z.number().optional().default(60),
        title: z.string().optional().default("Meeting"),
        description: z.string().optional(),
        addMeetLink: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const startDate = new Date(input.dateTime);
      const endDate = new Date(startDate.getTime() + input.duration * 60000);

      if (!ctx.accessToken) {
        return {
          success: true,
          event: { id: "mock_quick_" + Date.now(), summary: input.title },
        };
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);
        const res = await corsair.googlecalendar.api.events.create({
          calendarId: "primary",
          sendUpdates: "all",
          event: {
            summary: input.title,
            description: input.description || `Meeting with ${input.emails}`,
            start: { dateTime: startDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
            attendees: input.emails.split(",").map(e => ({ email: e.trim() })).filter(e => e.email),
          },
        });

        if (input.addMeetLink) {
          // Patch the newly created Corsair event with the Google SDK to add the Meet link
          const cal = getCalendarClient(ctx.accessToken, ctx.refreshToken);
          const patchedRes = await cal.events.patch({
            calendarId: "primary",
            eventId: res.id!,
            conferenceDataVersion: 1,
            requestBody: {
              conferenceData: {
                createRequest: {
                  requestId: crypto.randomUUID(),
                  conferenceSolutionKey: { type: "hangoutsMeet" }
                }
              }
            }
          });
          return { success: true, event: patchedRes.data };
        }

        return { success: true, event: res };
      } catch (error: any) {
        console.error("[Calendar] QuickInvite error:", error?.message);
        throw new Error("Failed to send invite: " + error?.message);
      }
    }),

  // Update event
  updateEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        summary: z.string().optional(),
        description: z.string().optional(),
        startDateTime: z.string().optional(),
        endDateTime: z.string().optional(),
        calendarId: z.string().optional().default("primary"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        return { id: input.eventId, status: "updated" };
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);
        const patchBody: Record<string, unknown> = {};
        if (input.summary) patchBody.summary = input.summary;
        if (input.description) patchBody.description = input.description;
        if (input.startDateTime) patchBody.start = { dateTime: input.startDateTime };
        if (input.endDateTime) patchBody.end = { dateTime: input.endDateTime };

        const res = await corsair.googlecalendar.api.events.update({
          calendarId: input.calendarId,
          id: input.eventId,
          event: patchBody,
        });
        return res;
      } catch (error: any) {
        console.error("[Calendar] Update error:", error?.message);
        return { id: input.eventId, status: "error" };
      }
    }),

  // Delete event
  deleteEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        calendarId: z.string().optional().default("primary"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { success: true };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        await corsair.googlecalendar.api.events.delete({
          calendarId: input.calendarId,
          id: input.eventId,
        });
        return { success: true };
      } catch (error: any) {
        console.error("[Calendar] Delete error:", error?.message);
        return { success: false };
      }
    }),

  // Today's agenda
  todayAgenda: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    if (!ctx.accessToken) return getMockEvents();

    try {
      const corsair = getCorsairForTenant(ctx.userId);
      const res = await corsair.googlecalendar.api.events.getMany({
        calendarId: "primary",
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      return {
        items: (res.items || []).map((evt) => ({
          id: evt.id!,
          summary: evt.summary || "(No title)",
          description: evt.description || "",
          start: evt.start || {},
          end: evt.end || {},
          attendees: evt.attendees || [],
          location: evt.location || "",
          status: evt.status || "confirmed",
          colorId: evt.colorId,
        })),
      };
    } catch (error: any) {
      console.error("[Calendar] Today error:", error?.message);
      return getMockEvents();
    }
  }),
});

// =============================================
// Mock data (used when no Google token)
// =============================================

function getMockEvents() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    items: [
      {
        id: "evt_1", summary: "Team Standup",
        description: "Daily sync with the engineering team",
        start: { dateTime: new Date(today.getTime() + 9 * 3600000).toISOString() },
        end: { dateTime: new Date(today.getTime() + 9.5 * 3600000).toISOString() },
        attendees: [{ email: "sarah@acme.co", responseStatus: "accepted" }],
        location: "", status: "confirmed", colorId: "1",
      },
      {
        id: "evt_2", summary: "Design Review",
        description: "Review new dashboard mockups",
        start: { dateTime: new Date(today.getTime() + 11 * 3600000).toISOString() },
        end: { dateTime: new Date(today.getTime() + 12 * 3600000).toISOString() },
        attendees: [{ email: "jordan@acme.co", responseStatus: "tentative" }],
        location: "Conference Room B", status: "confirmed", colorId: "2",
      },
      {
        id: "evt_3", summary: "Sprint Planning",
        description: "Plan next sprint tasks",
        start: { dateTime: new Date(today.getTime() + 14 * 3600000).toISOString() },
        end: { dateTime: new Date(today.getTime() + 15 * 3600000).toISOString() },
        attendees: [], location: "", status: "confirmed", colorId: "4",
      },
    ],
    nextPageToken: undefined,
  };
}
