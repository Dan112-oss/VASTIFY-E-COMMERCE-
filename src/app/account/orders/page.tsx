import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDate, orderNumber } from "@/lib/queries/admin";
import { getMyOrders } from "@/lib/queries/orders";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My orders | Vastify",
};

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/orders");

  const orders = await getMyOrders(supabase, user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-32 sm:px-6">
      <Link
        href="/account"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to account
      </Link>
      <h1 className="mb-8 mt-3 font-display text-3xl font-semibold">
        My orders
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Package className="size-6" />
          </span>
          <h2 className="font-display text-xl font-semibold">
            No orders yet
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            When you place an order, it will show up here with its delivery
            status.
          </p>
          <Link
            href="/products"
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {orders.map((order) => {
            const itemCount = (order.order_items ?? []).reduce(
              (sum, i) => sum + i.quantity,
              0,
            );
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{orderNumber(order.id)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)} · {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm font-semibold">
                      {formatPrice(order.total_cents, order.currency)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
