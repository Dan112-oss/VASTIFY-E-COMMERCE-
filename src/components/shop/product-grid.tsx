"use client";

import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/types/product";

type ListProps = {
  products: Product[];
  className?: string;
};

/** Responsive grid for listing and category pages */
export function ProductGrid({ products, className }: ListProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/** Horizontal swipeable row, like the "Deals of the Day" layout */
export function ProductRow({ products, className }: ListProps) {
  return (
    <div
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="w-[78%] shrink-0 snap-start sm:w-72"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
