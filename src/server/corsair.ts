import "server-only";
import { createCorsair, setupCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { pool } from "./db";

export const corsair = createCorsair({
  plugins: [
    gmail(),
    googlecalendar(),
  ],
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});

export async function ensureTenantCorsairAccount(tenantId: string) {
  // Use Corsair's official, idempotent tenant provisioning
  await setupCorsair(corsair, { tenantId });
}

// Helper to get a tenant-scoped corsair instance
export function getCorsairForTenant(tenantId: string) {
  return corsair.withTenant(tenantId);
}

const syncedTenants = new Set<string>();
let globalKeysSynced = false;

export async function syncCorsairTokens(session: any) {
  const tenantId = session?.user?.id;
  if (!tenantId) return;

  try {
    const globalCorsairAny = corsair as any;
    if (!globalKeysSynced) {
      const currentClientId = await globalCorsairAny.keys.googlecalendar.get_client_id().catch(() => null);
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== currentClientId) {
        await globalCorsairAny.keys.googlecalendar.set_client_id(process.env.GOOGLE_CLIENT_ID);
        await globalCorsairAny.keys.gmail.set_client_id(process.env.GOOGLE_CLIENT_ID);
      }
      const currentClientSecret = await globalCorsairAny.keys.googlecalendar.get_client_secret().catch(() => null);
      if (process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== currentClientSecret) {
        await globalCorsairAny.keys.googlecalendar.set_client_secret(process.env.GOOGLE_CLIENT_SECRET);
        await globalCorsairAny.keys.gmail.set_client_secret(process.env.GOOGLE_CLIENT_SECRET);
      }
      globalKeysSynced = true;
    }

    if (!syncedTenants.has(tenantId)) {
      await ensureTenantCorsairAccount(tenantId);
      const tenantCorsairAny = corsair.withTenant(tenantId) as any;
      const currentRefreshToken = await tenantCorsairAny.googlecalendar.keys.get_refresh_token().catch(() => null);
      if (session.refreshToken && session.refreshToken !== currentRefreshToken) {
        await tenantCorsairAny.googlecalendar.keys.set_refresh_token(session.refreshToken);
        await tenantCorsairAny.gmail.keys.set_refresh_token(session.refreshToken);
        if (session.accessToken) {
          await tenantCorsairAny.googlecalendar.keys.set_access_token(session.accessToken);
          await tenantCorsairAny.gmail.keys.set_access_token(session.accessToken);
        }
      }
      syncedTenants.add(tenantId);
    }
  } catch (err) {
    console.error("[Corsair Sync Error]:", err);
  }
}
