import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Supabase = Awaited<ReturnType<typeof createClient>>;

// Cached per request so the layout and the page share one lookup
const getAdminContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isAdmin: false };

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    isAdmin: Boolean((data as unknown as { is_admin: boolean } | null)?.is_admin),
  };
});

/** Login required, and the account must be an admin (otherwise a 404) */
export async function requireAdmin(nextPath: string) {
  const ctx = await getAdminContext();

  if (!ctx.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!ctx.isAdmin) notFound();

  return { supabase: ctx.supabase, user: ctx.user };
}

export async function getAdminCounts(supabase: Supabase) {
  const [sellers, products, orders] = await Promise.all([
    supabase
      .from("sellers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["paid", "processing"]),
  ]);

  return {
    pendingSellers: sellers.count ?? 0,
    pendingProducts: products.count ?? 0,
    ordersToProcess: orders.count ?? 0,
  };
}

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function orderNumber(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
