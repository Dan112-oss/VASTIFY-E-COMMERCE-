import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = "sm",
  showValue = false,
  count,
}: {
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  count?: number;
}) {
  const iconSize = size === "md" ? "size-5" : "size-4";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              iconSize,
              n <= Math.round(value)
                ? "fill-primary text-primary"
                : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground">
          {value.toFixed(1)}
          {typeof count === "number" && ` (${count})`}
        </span>
      )}
    </div>
  );
}
