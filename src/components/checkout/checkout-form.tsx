"use client";

import * as React from "react";
import { formatPrice } from "@/lib/format";
import { selectSubtotal, useCartHydrated, useCartStore } from "@/store/cart";
import {
  createCheckoutSession,
  type CheckoutState,
} from "@/app/checkout/actions";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function CheckoutForm({ email }: { email: string }) {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);

  const [state, formAction, pending] = React.useActionState<
    CheckoutState,
    FormData
  >(createCheckoutSession, null);

  if (!hydrated) {
    return <div className="min-h-64" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        Your cart is empty.
      </p>
    );
  }

  const currency = items[0].currency;
  const cartPayload = JSON.stringify(
    items.map((i) => ({ id: i.id, quantity: i.quantity })),
  );

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="cart" value={cartPayload} />

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-xl font-semibold">
          Delivery address
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            maxLength={120}
            className={inputClass}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="line1" className="text-sm font-medium">
            Address
          </label>
          <input
            id="line1"
            name="line1"
            required
            maxLength={160}
            className={inputClass}
            placeholder="Street address"
          />
          <input
            id="line2"
            name="line2"
            maxLength={160}
            className={inputClass}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              required
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="state" className="text-sm font-medium">
              State / region
            </label>
            <input
              id="state"
              name="state"
              maxLength={100}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="postal_code" className="text-sm font-medium">
              Postal code
            </label>
            <input
              id="postal_code"
              name="postal_code"
              maxLength={20}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="country" className="text-sm font-medium">
              Country
            </label>
            <input
              id="country"
              name="country"
              required
              maxLength={60}
              className={inputClass}
              placeholder="e.g. United States"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            className={inputClass}
          />
        </div>

        {!email && (
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email for order updates
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
            />
          </div>
        )}

        {state?.error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-semibold">Order summary</h2>

        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate text-muted-foreground">
                {item.quantity} × {item.name}
              </span>
              <span className="shrink-0">
                {formatPrice(item.price_cents * item.quantity, item.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">
            {formatPrice(subtotal, currency)}
          </span>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Redirecting to payment..." : "Pay now"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll be taken to Stripe to complete your payment securely.
        </p>
      </aside>
    </form>
  );
}
