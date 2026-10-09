import { createPublicClient } from "@/lib/supabase/public";
import type { Supabase } from "@/lib/queries/admin";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  reviewer_name: string;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export async function getProductReviews(productId: string) {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, updated_at, user_id, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { reviews: [] as Review[], average: 0, count: 0 };
  }

  const rows = data as unknown as ReviewRow[];
  const reviews: Review[] = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    updated_at: r.updated_at,
    user_id: r.user_id,
    reviewer_name: one(r.profiles)?.full_name || "Verified buyer",
  }));

  const count = reviews.length;
  const average =
    count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

  return { reviews, average, count };
}

const EXCLUDED_STATUSES = ["pending", "cancelled", "refunded"];

/**
 * Checks (using the logged-in buyer's own session) whether they have an
 * order for this product and whether they've already reviewed it.
 * Uses two plain queries rather than one filtered join, which is more
 * reliable against Supabase's embedded-resource filter syntax.
 */
export async function getReviewEligibility(
  supabase: Supabase,
  userId: string,
  productId: string,
) {
  const [ordersRes, existingRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`),
    supabase
      .from("reviews")
      .select("id, rating, comment")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const orderIds = (ordersRes.data ?? []).map(
    (o) => (o as unknown as { id: string }).id,
  );

  let hasPurchased = false;
  if (orderIds.length > 0) {
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", productId)
      .in("order_id", orderIds)
      .limit(1);

    hasPurchased = (itemRows?.length ?? 0) > 0;
  }

  const existing = existingRes.data as unknown as
    | { id: string; rating: number; comment: string | null }
    | null;

  return { canReview: hasPurchased, existing };
}
