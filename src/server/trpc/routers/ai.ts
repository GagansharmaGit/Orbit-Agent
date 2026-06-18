import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { chatMessages } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const aiRouter = router({
  // Get chat history
  chatHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(1000),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.query.chatMessages.findMany({
        where: eq(chatMessages.userId, ctx.userId),
        orderBy: desc(chatMessages.createdAt),
        limit: input.limit,
      });
      return messages.reverse();
    }),

  // Save a message to history
  saveMessage: protectedProcedure
    .input(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        toolCalls: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [message] = await ctx.db
        .insert(chatMessages)
        .values({
          userId: ctx.userId,
          role: input.role,
          content: input.content,
          toolCalls: input.toolCalls,
        })
        .returning();
      return message;
    }),

  // Clear chat history
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(chatMessages)
      .where(eq(chatMessages.userId, ctx.userId));
    return { success: true };
  }),
});
