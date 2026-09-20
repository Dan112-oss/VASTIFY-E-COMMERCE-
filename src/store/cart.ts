import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

const MAX_QTY = 99;

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  image_url?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price_cents: product.price_cents,
                currency: product.currency,
                image_url: product.image_url ?? null,
                quantity: Math.min(quantity, MAX_QTY),
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i,
                ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "vastify-cart",
      // We rehydrate manually after the first render to avoid SSR mismatches
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.price_cents * i.quantity, 0);

/** True once the saved cart has been loaded from the browser */
export function useCartHydrated() {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    setHydrated(useCartStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}
