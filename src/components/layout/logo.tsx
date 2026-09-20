import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Vastify home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-primary/60 bg-primary/10 font-display text-xl font-semibold text-primary">
        V
      </span>
      {showWordmark && (
        <span className="font-display text-xl font-semibold tracking-[0.25em] text-foreground">
          VASTIFY
        </span>
      )}
    </Link>
  );
}
