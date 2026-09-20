"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart";

export function CartHydrator() {
  React.useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
