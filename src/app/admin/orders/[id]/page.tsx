import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  cardClass,
  inputClass,
} from "@/components/admin/styles";
import {
  formatDate,
  one,
  orderNumber,
  requireAdmin,
} from "@/lib/queries/admin";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { setPayoutStatus, updateOrder } from "@/app/admin/actions";

type Address = {
  full_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
};

type OrderItem = {
  id: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
  commission_rate: number | string;
  payout_status: string;
  seller_id: string | null;
  sellers: { store_name: string } | { store_name: string }[] | null;
};

type OrderDetail = {
  id: string;
  email: string | null;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  shipping_address: Address | null;
  carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  admin_notes: string | null;
  order_items: OrderItem[] | null;
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/orders/${id}`);

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, email, status, total_cents, currency, created_at, shipping_address, carrier, tracking_number, shipped_at, delivered_at, admin_notes, order_items(id, name, unit_price_cents, quantity, commission_rate, payout_status, seller_id, sellers(store_name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const order = data as unknown as OrderDetail;
  const items = order.order_items ?? [];
  const addr = order.shipping_address ?? {};

  const addressLines = [
    addr.full_name,
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
    addr.country,
    addr.phone,
  ].filter(Boolean) as string[];

  const canProcess = order.status === "paid";
  const canShip = order.status === "paid" || order.status === "processing";
  const canDeliver = order.status === "shipped";
  const canCancel = ["pending", "paid", "processing"].includes(order.status);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">
            Order {orderNumber(order.id)}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Placed {formatDate(order.created_at)}
        </p>
      </div>

      {/* Fulfilment actions */}
      {(canProcess || canShip || canDeliver || canCancel) && (
        <section className={`${cardClass} space-y-5 p-5`}>
          <h2 className="font-medium">Fulfilment</h2>

          {canProcess && (
            <form action={updateOrder}>
              <input type="hidden" name="order_id" value={order.id} />
              <input type="hidden" name="intent" value="processing" />
              <button type="submit" className={btnPrimary}>
                Start processing
              </button>
            </form>
          )}

          {canShip && (
            <form action={updateOrder} className="space-y-3">
              <input type="hidden" name="order_id" value={order.id} />
              <input type="hidden" name="intent" value="shipped" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="carrier" className="text-xs text-muted-foreground">
                    Carrier
                  </label>
                  <input
                    id="carrier"
                    name="carrier"
                    required
                    maxLength={80}
                    placeholder="e.g. DHL"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="tracking" className="text-xs text-muted-foreground">
                    Tracking number
                  </label>
                  <input
                    id="tracking"
                    name="tracking_number"
                    maxLength={120}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>
              </div>
              <button type="submit" className={btnPrimary}>
                Mark as shipped
              </button>
            </form>
          )}

          {canDeliver && (
            <form action={updateOrder}>
              <input type="hidden" name="order_id" value={order.id} />
              <input type="hidden" name="intent" value="delivered" />
              <button type="submit" className={btnPrimary}>
                Mark as delivered
              </button>
            </form>
          )}

          {canCancel && (
            <div className="border-t border-border pt-4">
              <form action={updateOrder}>
                <input type="hidden" name="order_id" value={order.id} />
                <input type="hidden" name="intent" value="cancelled" />
                <button type="submit" className={btnDanger}>
                  Cancel order
                </button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Refunds are issued from the Stripe dashboard.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Tracking info */}
      {(order.carrier || order.tracking_number) && (
        <section className={`${cardClass} p-5`}>
          <h2 className="mb-2 font-medium">Shipment</h2>
          <p className="text-sm text-muted-foreground">
            {order.carrier}
            {order.tracking_number && ` · Tracking ${order.tracking_number}`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.shipped_at && `Shipped ${formatDate(order.shipped_at)}`}
            {order.delivered_at &&
              ` · Delivered ${formatDate(order.delivered_at)}`}
          </p>
        </section>
      )}

      {/* Customer */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h2 className="mb-2 font-medium">Customer</h2>
          <p className="text-sm text-muted-foreground">
            {order.email ?? "No email"}
          </p>
        </div>
        <div className={`${cardClass} p-5`}>
          <h2 className="mb-2 font-medium">Delivery address</h2>
          {addressLines.length > 0 ? (
            <address className="text-sm not-italic text-muted-foreground">
              {addressLines.map((line, i) => (
                <div key={`${line}-${i}`}>{line}</div>
              ))}
            </address>
          ) : (
            <p className="text-sm text-muted-foreground">No address saved.</p>
          )}
        </div>
      </section>

      {/* Items */}
      <section className={cardClass}>
        <h2 className="border-b border-border px-5 py-4 font-medium">Items</h2>
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const rate = Number(item.commission_rate);
            const line = item.unit_price_cents * item.quantity;
            const sellerName = one(item.sellers)?.store_name;
            const sellerGets = Math.round(line * (1 - rate / 100));
            const paid = item.payout_status === "paid";

            return (
              <li key={item.id} className="space-y-3 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} ×{" "}
                      {formatPrice(item.unit_price_cents, order.currency)}
                      {" · "}
                      {sellerName ? `Seller: ${sellerName}` : "Sold by Vastify"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatPrice(line, order.currency)}
                  </span>
                </div>

                {item.seller_id && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Seller receives{" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(sellerGets, order.currency)}
                      </span>{" "}
                      ({rate}% commission) ·{" "}
                      <span className={paid ? "text-emerald-400" : ""}>
                        {paid ? "Paid out" : "Not paid yet"}
                      </span>
                    </p>
                    <form action={setPayoutStatus}>
                      <input type="hidden" name="order_id" value={order.id} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={paid ? "unpaid" : "paid"}
                      />
                      <button
                        type="submit"
                        className={cn(btnGhost, "h-8 px-3 text-xs")}
                      >
                        {paid ? "Mark unpaid" : "Mark seller paid"}
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">
            {formatPrice(order.total_cents, order.currency)}
          </span>
        </div>
      </section>

      {/* Notes */}
      <section className={`${cardClass} p-5`}>
        <h2 className="mb-3 font-medium">Internal notes</h2>
        <form action={updateOrder} className="space-y-3">
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="intent" value="notes" />
          <textarea
            name="admin_notes"
            rows={3}
            maxLength={2000}
            defaultValue={order.admin_notes ?? ""}
            placeholder="Only visible to admins"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button type="submit" className={btnGhost}>
            Save notes
          </button>
        </form>
      </section>
    </div>
  );
}
