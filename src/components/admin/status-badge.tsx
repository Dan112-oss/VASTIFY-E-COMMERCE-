import { cn } from "@/lib/utils";

const TONES = {
  gold: "border-primary/40 bg-primary/10 text-primary",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  red: "border-destructive/40 bg-destructive/10 text-destructive",
  blue: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  gray: "border-border text-muted-foreground",
} as const;

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  // sellers and products
  pending: "gold",
  approved: "green",
  suspended: "red",
  rejected: "red",
  draft: "gray",
  // orders
  paid: "gold",
  processing: "blue",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
  refunded: "red",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = TONES[STATUS_TONE[status] ?? "gray"];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        tone,
        className,
      )}
    >
      {status}
    </span>
  );
}
