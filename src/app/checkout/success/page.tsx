import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { CartClearer } from "@/components/checkout/cart-clearer";

export const metadata: Metadata = {
  title: "Order confirmed | Vastify",
};

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  email: string | null;
};

async function getOrder(sessionId: string): Promise<OrderRow | null> {
  const admin = createAdminClient();

  // The webhook usually wins the race, but if it hasn't landed yet,
  // check directly with Stripe and reflect the paid status immediately.
  const { data } = await admin
    .from("orders")
    .select("id, status, total_cents, currency, email")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  let order = data as unknown as OrderRow | null;
  if (order && order.status === "pending") {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await admin
          .from("orders")
          .update({
            status: "paid",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
          })
          .eq("id", order.id)
          .eq("status", "pending");
        order = { ...order, status: "paid" };
      }
    } catch {
      // Fall through and show what we have
    }
  }

  return order;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const order = session_id ? await getOrder(session_id) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-5 px-4 pb-16 pt-32 text-center">
      {order ? <CartClearer /> : null}

      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="size-8" />
      </span>

      <h1 className="font-display text-3xl font-semibold">
        {order ? "Order confirmed" : "Payment received"}
      </h1>

      {order ? (
        <>
          <p className="text-muted-foreground">
            Thanks for your order. A confirmation has been sent to{" "}
            <strong>{order.email}</strong>.
          </p>
          <div className="w-full rounded-2xl border border-border bg-card p-5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Order</span>
              <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                {formatPrice(order.total_cents, order.currency)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">
          We&apos;re confirming your payment. This can take a minute to
          finish processing.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
        <Link
          href="/account"
          className="rounded-full border border-border px-8 py-3 text-sm font-semibold transition-colors hover:bg-accent"
        >
          View my account
        </Link>
      </div>
    </main>
  );
}
