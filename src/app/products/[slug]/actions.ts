"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ReviewState = { error?: string; ok?: boolean } | null;

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const productId = String(formData.get("product_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 1000);

  if (!productId || !slug) {
    return { error: "Something went wrong. Please refresh and try again." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a star rating." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/products/${slug}`);

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment || null,
    },
    { onConflict: "product_id,user_id" },
  );

  if (error) {
    return {
      error:
        "Could not save your review. You can only review products you've ordered.",
    };
  }

  revalidatePath(`/products/${slug}`);
  return { ok: true };
}
