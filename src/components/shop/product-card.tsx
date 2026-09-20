"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  className,
}: ProductCardProps) {
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    onAddToCart?.(product);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  }

  const href = `/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-primary/40",
        className,
      )}
    >
      {/* Image */}
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-secondary"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-linear-to-br from-secondary to-card">
            <span className="font-display text-6xl font-semibold text-primary/30">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {product.category_name && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="size-4" />
            <span>{product.category_name}</span>
          </div>
        )}

        <h3 className="font-display text-lg font-semibold leading-snug">
          <Link href={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Price
            </div>
            <div className="text-base font-semibold">
              {formatPrice(product.price_cents, product.currency)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full transition-colors",
              added
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
