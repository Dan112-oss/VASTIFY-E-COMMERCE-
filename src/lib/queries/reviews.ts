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

/**
 * Checks (using the logged-in buyer's own session) whether they have an
 * order for this product and whether they've already reviewed it.
 */
export async function getReviewEligibility(
  supabase: Supabase,
  userId: string,
  productId: string,
) {
  const [purchaseRes, existingRes] = await Promise.all([
    supabase
      .from("order_items")
      .select("id, orders!inner(user_id, status)")
      .eq("product_id", productId)
      .eq("orders.user_id", userId)
      .not("orders.status", "in", "(pending,cancelled,refunded)")
      .limit(1),
    supabase
      .from("reviews")
      .select("id, rating, comment")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const hasPurchased = (purchaseRes.data?.length ?? 0) > 0;
  const existing = existingRes.data as unknown as
    | { id: string; rating: number; comment: string | null }
    | null;

  return { canReview: hasPurchased, existing };
}
