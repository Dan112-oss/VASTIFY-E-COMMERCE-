import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  // Show first, last, current, and one neighbour on each side
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });

  const pillBase =
    "inline-flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-label="Previous page"
        aria-disabled={page === 1}
        className={cn(
          pillBase,
          "border border-border",
          page === 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-accent",
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {items.map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            className="w-6 text-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              pillBase,
              item === page
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-accent",
            )}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        aria-disabled={page === totalPages}
        className={cn(
          pillBase,
          "border border-border",
          page === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-accent",
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
