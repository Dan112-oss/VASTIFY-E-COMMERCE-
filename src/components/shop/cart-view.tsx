"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import {
  selectSubtotal,
  useCartHydrated,
  useCartStore,
} from "@/store/cart";

export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  if (!hydrated) {
    return <div className="min-h-64" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-6" />
        </span>
        <h2 className="font-display text-2xl font-semibold">
          Your cart is empty
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet. Find something you
          love.
        </p>
        <Link
          href="/"
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const currency = items[0].currency;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24"
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-linear-to-br from-secondary to-card font-display text-3xl text-primary/40">
                    {item.name.charAt(0)}
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="line-clamp-2 font-medium hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price_cents, item.currency)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="inline-flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <span className="font-semibold">
                    {formatPrice(item.price_cents * item.quantity, item.currency)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={clear}
          className="mt-4 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline"
        >
          Clear cart
        </button>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-semibold">Order summary</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-muted-foreground">Calculated at checkout</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">
            {formatPrice(subtotal, currency)}
          </span>
        </div>

        <button
          type="button"
          disabled
          className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground opacity-60"
        >
          Checkout (coming next)
        </button>
      </aside>
    </div>
  );
}
