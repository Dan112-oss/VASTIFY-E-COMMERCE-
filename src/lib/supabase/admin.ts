import { createClient } from "@supabase/supabase-js";

/**
 * Full-access Supabase client for trusted server code only
 * (creating orders, handling Stripe webhooks).
 * It bypasses row-level security, so NEVER import this in a client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service role configuration");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
