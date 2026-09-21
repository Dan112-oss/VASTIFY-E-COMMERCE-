"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/seller/actions";

export function DeleteProductButton({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="product_id" value={productId} />
      <button
        type="submit"
        aria-label={`Delete ${name}`}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}
