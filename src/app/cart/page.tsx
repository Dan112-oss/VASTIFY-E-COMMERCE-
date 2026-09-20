import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = {
  title: "Your cart | Vastify",
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold">Your cart</h1>
      <CartView />
    </main>
  );
}
