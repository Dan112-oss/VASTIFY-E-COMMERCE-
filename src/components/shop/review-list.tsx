import { StarRating } from "@/components/shop/star-rating";
import type { Review } from "@/lib/queries/reviews";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewList({
  reviews,
  average,
  count,
}: {
  reviews: Review[];
  average: number;
  count: number;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-semibold">Reviews</h2>
        {count > 0 && <StarRating value={average} showValue count={count} />}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{review.reviewer_name}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(review.created_at)}
                </span>
              </div>
              <StarRating value={review.rating} />
              {review.comment && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
