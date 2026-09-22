"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart";

export function CartClearer() {
  const clear = useCartStore((s) => s.clear);

  React.useEffect(() => {
    clear();
    // Runs once when the success page mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
