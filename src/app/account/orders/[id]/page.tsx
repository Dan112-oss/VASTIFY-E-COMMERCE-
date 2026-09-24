import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDate, orderNumber } from "@/lib/queries/admin";
import { getMyOrderById } from "@/lib/queries/orders";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order details | Vastify",
};

export default async function MyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/account/orders/${id}`);

  const order = await getMyOrderById(supabase, user.id, id);
  if (!order) notFound();

  const addr = order.shipping_address ?? {};
  const addressLines = [
    addr.full_name,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-32 sm:px-6">
      <Link
        href="/account/orders"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to my orders
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold">
          Order {orderNumber(order.id)}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Placed {formatDate(order.created_at)}
      </p>

      {(order.carrier || order.tracking_number) && (
        <section className="mb-6 rounded-2xl border border-primary/30 bg-card p-5">
          <h2 className="mb-1 font-medium">Shipment</h2>
          <p className="text-sm text-muted-foreground">
            {order.carrier}
            {order.tracking_number && ` · Tracking ${order.tracking_number}`}
          </p>
        </section>
      )}

      {addressLines.length > 0 && (
        <section className="mb-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-medium">Delivery address</h2>
          <address className="text-sm not-italic text-muted-foreground">
            {addressLines.map((line, i) => (
              <div key={`${line}-${i}`}>{line}</div>
            ))}
          </address>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card">
        <h2 className="border-b border-border px-5 py-4 font-medium">
          Items
        </h2>
        <ul className="divide-y divide-border">
          {order.order_items.map((item) => (
            <li
              {
  order.order_items.map((item, index) => ( <
        li key = { index }
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-muted-foreground">
                {item.quantity} × {item.name}
              </span>
              <span className="font-medium">
                {formatPrice(
                  item.unit_price_cents * item.quantity,
                  order.currency,
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">
            {formatPrice(order.total_cents, order.currency)}
          </span>
        </div>
      </section>
    </main>
  );
}
