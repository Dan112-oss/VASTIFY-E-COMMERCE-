"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReview, type ReviewState } from "@/app/products/[slug]/actions";

export function ReviewForm({
  productId,
  slug,
  existing,
}: {
  productId: string;
  slug: string;
  existing: { rating: number; comment: string | null } | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState<
    ReviewState,
    FormData
  >(submitReview, null);

  const [rating, setRating] = React.useState(existing?.rating ?? 0);
  const [hover, setHover] = React.useState(0);

  // Force the page's server-rendered review list to refetch once the
  // review has actually saved, instead of waiting on automatic refresh.
  React.useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl border border-border bg-card p-5"
    >
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <h3 className="font-medium">
        {existing ? "Update your review" : "Write a review"}
      </h3>

      <div
        className="flex gap-1"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                n <= (hover || rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={3}
        maxLength={1000}
        defaultValue={existing?.comment ?? ""}
        placeholder="Share what you liked or didn't (optional)"
        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm text-primary">
          Thanks! Your review has been posted.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving..." : existing ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
