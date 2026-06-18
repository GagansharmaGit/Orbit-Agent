import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { getCorsairForTenant } from "@/server/corsair";

// Helper: extract header value from Gmail message headers
function getHeader(headers: { name?: string | null; value?: string | null }[] | undefined, name: string): string {
  if (!headers) return "";
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

// Global in-memory cache to restore blazing fast speeds without Upstash Redis
const globalCache = (globalThis as any).mailCache || new Map<string, any>();
if (process.env.NODE_ENV !== "production") {
  (globalThis as any).mailCache = globalCache;
}

export const mailRouter = router({
  // List emails
  list: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        maxResults: z.number().optional().default(20),
        labelIds: z.array(z.string()).optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // NOTE: Using ctx.accessToken to conditionally fall back to mock data
      if (!ctx.accessToken) {
        return { messages: getMockEmails(), nextPageToken: undefined };
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);

        // First load 10 emails, then load 5 on subsequent scrolls to optimize performance
        const effectiveMaxResults = input.cursor ? 5 : 10;

        console.time(`[Mail List] 1. Corsair messages.list (${effectiveMaxResults} items)`);
        const listRes = await corsair.gmail.api.messages.list({
          maxResults: effectiveMaxResults,
          q: input.query || undefined,
          labelIds: input.labelIds || ["INBOX"],
          pageToken: input.cursor || undefined,
        });
        console.timeEnd(`[Mail List] 1. Corsair messages.list (${effectiveMaxResults} items)`);

        if (!listRes.messages?.length) {
          return { messages: [], nextPageToken: listRes.nextPageToken };
        }

        const messages = (await Promise.all(
          listRes.messages.map(async (msg) => {
            try {
              // 1. Check blazing-fast memory cache first
              if (globalCache.has(msg.id!)) {
                return globalCache.get(msg.id!);
              }

              // 2. Fetch from Corsair if not in cache
              const detail = await corsair.gmail.api.messages.get({
                id: msg.id!,
                format: "metadata",
              });

              const headers = detail.payload?.headers || [];
              const labelIds = detail.labelIds || [];

              const parsedMsg = {
                id: detail.id!,
                threadId: detail.threadId!,
                snippet: detail.snippet || "",
                subject: getHeader(headers, "Subject"),
                from: getHeader(headers, "From"),
                to: getHeader(headers, "To"),
                date: getHeader(headers, "Date"),
                labelIds,
                isUnread: labelIds.includes("UNREAD"),
                isStarred: labelIds.includes("STARRED"),
                isImportant: labelIds.includes("IMPORTANT"),
                priority: labelIds.includes("IMPORTANT") ? "high" as const : "none" as const,
              };

              // 3. Save to cache (limit size to 1000 to prevent memory leaks)
              globalCache.set(msg.id!, parsedMsg);
              if (globalCache.size > 1000) {
                const firstKey = globalCache.keys().next().value;
                globalCache.delete(firstKey);
              }

              return parsedMsg;
            } catch (err) {
              console.error(`[Mail List] Failed to fetch message ${msg.id}:`, err);
              return null;
            }
          })
        )).filter(Boolean) as any[];


        return {
          messages,
          nextPageToken: listRes.nextPageToken,
        };
      } catch (error: any) {
        console.error("[Mail] List error:", error?.message);
        throw new Error("Failed to fetch emails");
      }
    }),

  // Send email
  send: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
        cc: z.string().optional(),
        bcc: z.string().optional(),
        replyToMessageId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        return { id: "mock_sent_" + Date.now(), threadId: "mock_thread", success: true };
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);

        // Build RFC 2822 message
        const headers = [
          `To: ${input.to}`,
          input.cc ? `Cc: ${input.cc}` : "",
          input.bcc ? `Bcc: ${input.bcc}` : "",
          `Subject: ${input.subject}`,
          "Content-Type: text/plain; charset=utf-8",
        ].filter(Boolean);

        const lines = [...headers, "", input.body].join("\r\n");

        const encodedMessage = Buffer.from(lines)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const res = await corsair.gmail.api.messages.send({
          raw: encodedMessage,
          threadId: input.replyToMessageId || undefined,
        });

        return {
          id: res.id!,
          threadId: res.threadId!,
          success: true,
        };
      } catch (error: any) {
        console.error("[Mail] Send error:", error?.message);
        throw new Error("Failed to send email: " + error?.message);
      }
    }),

  // Create draft
  createDraft: protectedProcedure
    .input(
      z.object({
        to: z.string(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) {
        return { id: "mock_draft_" + Date.now(), success: true };
      }

      try {
        const corsair = getCorsairForTenant(ctx.userId);

        const lines = [
          `To: ${input.to}`,
          `Subject: ${input.subject}`,
          "Content-Type: text/plain; charset=utf-8",
          "",
          input.body,
        ].join("\r\n");

        const encodedMessage = Buffer.from(lines)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const res = await corsair.gmail.api.drafts.create({
          draft: {
            message: { raw: encodedMessage },
          },
        });

        return { id: res.id!, success: true };
      } catch (error: any) {
        console.error("[Mail] Draft error:", error?.message);
        throw new Error("Failed to create draft");
      }
    }),

  // Archive (remove from inbox)
  archive: protectedProcedure
    .input(z.object({ id: z.string(), currentLabels: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { success: true };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        await corsair.gmail.api.messages.modify({
          id: input.id,
          removeLabelIds: ["INBOX"],
        });
        
        // Remove from memory cache
        globalCache.delete(input.id);
        
        return { success: true };
      } catch (error: any) {
        console.error("[Mail] Archive error:", error?.message);
        return { success: false };
      }
    }),

  // Mark as read
  markRead: protectedProcedure
    .input(z.object({ id: z.string(), currentLabels: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { success: true };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        await corsair.gmail.api.messages.modify({
          id: input.id,
          removeLabelIds: ["UNREAD"],
        });
        
        // Update memory cache
        if (globalCache.has(input.id)) {
          const cached = globalCache.get(input.id);
          cached.isUnread = false;
          if (cached.labelIds) {
            cached.labelIds = cached.labelIds.filter((l: string) => l !== "UNREAD");
          }
        }
        
        return { success: true };
      } catch (error: any) {
        console.error("[Mail] MarkRead error:", error?.message);
        return { success: false };
      }
    }),

  // Mark as unread
  markUnread: protectedProcedure
    .input(z.object({ id: z.string(), currentLabels: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { success: true };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        await corsair.gmail.api.messages.modify({
          id: input.id,
          addLabelIds: ["UNREAD"],
        });

        
        // Remove from memory cache
        globalCache.delete(input.id);
        
        return { success: true };
      } catch (error: any) {
        console.error("[Mail] MarkUnread error:", error?.message);
        return { success: false };
      }
    }),

  // Trash
  trash: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { success: true };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        await corsair.gmail.api.messages.trash({ id: input.id });
        
        // Remove from memory cache completely
        globalCache.delete(input.id);
        
        return { success: true };
      } catch (error: any) {
        console.error("[Mail] Trash error:", error?.message);
        return { success: false };
      }
    }),

  // Star / Unstar
  toggleStar: protectedProcedure
    .input(z.object({ id: z.string(), starred: z.boolean(), currentLabels: z.array(z.string()).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { success: true };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        let newLabels = input.currentLabels || [];

        if (input.starred) {
          await corsair.gmail.api.messages.modify({
            id: input.id,
            addLabelIds: ["STARRED"],
          });
          if (input.currentLabels && !newLabels.includes("STARRED")) {
            newLabels.push("STARRED");
          }
        } else {
          await corsair.gmail.api.messages.modify({
            id: input.id,
            removeLabelIds: ["STARRED"],
          });
          if (input.currentLabels) {
            newLabels = newLabels.filter(l => l !== "STARRED");
          }
        }
        
        // Update memory cache
        if (globalCache.has(input.id)) {
          const cached = globalCache.get(input.id);
          cached.isStarred = input.starred;
          if (cached.labelIds) {
            if (input.starred && !cached.labelIds.includes("STARRED")) {
              cached.labelIds.push("STARRED");
            } else if (!input.starred) {
              cached.labelIds = cached.labelIds.filter((l: string) => l !== "STARRED");
            }
          }
        }
        
        return { success: true };
      } catch (error: any) {
        console.error("[Mail] Star error:", error?.message);
        return { success: false };
      }
    }),

  // Search
  search: protectedProcedure
    .input(z.object({ query: z.string(), maxResults: z.number().optional().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.accessToken) return { messages: [] };
      try {
        const corsair = getCorsairForTenant(ctx.userId);
        const res = await corsair.gmail.api.messages.list({
          q: input.query,
          maxResults: input.maxResults,
        });

        if (!res.messages?.length) return { messages: [] };
        
        const messages = (await Promise.all(
          res.messages.map(async (msg) => {
            try {
              if (globalCache.has(msg.id!)) {
                return globalCache.get(msg.id!);
              }

              const detail = await corsair.gmail.api.messages.get({
                id: msg.id!,
                format: "metadata",
              });
              
              const headers = detail.payload?.headers || [];
              const parsedMsg = {
                id: detail.id!,
                threadId: detail.threadId!,
                snippet: detail.snippet || "",
                subject: getHeader(headers, "Subject"),
                from: getHeader(headers, "From"),
                date: getHeader(headers, "Date"),
                isUnread: detail.labelIds?.includes("UNREAD") || false,
              };

              globalCache.set(msg.id!, parsedMsg);
              if (globalCache.size > 1000) {
                const firstKey = globalCache.keys().next().value;
                globalCache.delete(firstKey);
              }

              return parsedMsg;
            } catch (err) {
              console.error(`[Mail Search] Failed to fetch message ${msg.id}:`, err);
              return null;
            }
          })
        )).filter(Boolean) as any[];

        return { messages };
      } catch (error: any) {
        console.error("[Mail] Search error:", error?.message);
        return { messages: [] };
      }
    }),

  // Get labels
  labels: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.accessToken) return { labels: [] };
    try {
      const corsair = getCorsairForTenant(ctx.userId);
      const res = await corsair.gmail.api.labels.list({});
      return { labels: res.labels || [] };
    } catch (error: any) {
      console.error("[Mail] Labels error:", error?.message);
      return { labels: [] };
    }
  }),
});

// =============================================
// Mock data (used when no Google token)
// =============================================

function getMockEmails() {
  const now = Date.now();
  return [
    {
      id: "mock_1", threadId: "t1",
      snippet: "Hey! Just wanted to follow up on our conversation about the new project timeline...",
      subject: "Re: Project Timeline Q3", from: "Sarah Chen <sarah@acme.co>",
      to: "demo@orbit.dev", date: new Date(now - 900000).toISOString(),
      labelIds: ["INBOX", "UNREAD", "IMPORTANT"], isUnread: true, isStarred: false,
      isImportant: true, priority: "high" as const,
    },
    {
      id: "mock_2", threadId: "t2",
      snippet: "The design review meeting has been moved to Thursday at 2 PM...",
      subject: "Design Review - Schedule Change", from: "Mike Johnson <mike@acme.co>",
      to: "demo@orbit.dev", date: new Date(now - 2700000).toISOString(),
      labelIds: ["INBOX", "UNREAD"], isUnread: true, isStarred: false,
      isImportant: false, priority: "medium" as const,
    },
    {
      id: "mock_3", threadId: "t3",
      snippet: "Thanks for the update. I've reviewed the latest build and everything looks...",
      subject: "Build Review Approved ✅", from: "Alex Rivera <alex@acme.co>",
      to: "demo@orbit.dev", date: new Date(now - 7200000).toISOString(),
      labelIds: ["INBOX"], isUnread: false, isStarred: false,
      isImportant: false, priority: "low" as const,
    },
    {
      id: "mock_4", threadId: "t4",
      snippet: "Your invoice for June 2026 is ready. Amount: $2,450.00...",
      subject: "Invoice #INV-2026-061 Ready", from: "Billing <billing@vendor.com>",
      to: "demo@orbit.dev", date: new Date(now - 10800000).toISOString(),
      labelIds: ["INBOX"], isUnread: false, isStarred: false,
      isImportant: false, priority: "low" as const,
    },
    {
      id: "mock_5", threadId: "t5",
      snippet: "Congratulations! Your application to speak at DevConf 2026 has been accepted...",
      subject: "🎉 DevConf 2026 Speaker Confirmation", from: "DevConf Team <noreply@devconf.io>",
      to: "demo@orbit.dev", date: new Date(now - 18000000).toISOString(),
      labelIds: ["INBOX", "IMPORTANT"], isUnread: false, isStarred: true,
      isImportant: true, priority: "high" as const,
    },
  ];
}
