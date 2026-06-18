import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { corsair, syncCorsairTokens } from "@/server/corsair";

export const createTRPCContext = async () => {
  const session = await auth();
  return {
    db,
    corsair,
    session,
    userId: session?.user?.id,
    // Google OAuth tokens for direct API access
    accessToken: session?.accessToken,
    refreshToken: session?.refreshToken,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

// Auth middleware — ensures user is logged in and tokens are available
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  
  // Ensure Corsair tokens are synced for this session
  await syncCorsairTokens(ctx.session);

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id!,
      accessToken: ctx.accessToken,
      refreshToken: ctx.refreshToken,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
