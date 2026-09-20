"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

export function AddToCartPanel({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-accent"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors",
            added
              ? "bg-secondary text-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          {added ? (
            <>
              <Check className="size-4 text-primary" />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              Add to cart
            </>
          )}
        </button>
      </div>

      {added && (
        <p className="text-sm text-muted-foreground">
          Item added.{" "}
          <Link href="/cart" className="font-medium text-primary hover:underline">
            View cart
          </Link>
        </p>
      )}
    </div>
  );
}
