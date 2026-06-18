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
