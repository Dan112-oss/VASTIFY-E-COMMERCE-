import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { cardClass } from "@/components/admin/styles";
import { formatDate, orderNumber, requireAdmin } from "@/lib/queries/admin";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "todo", label: "To process", statuses: ["paid", "processing"] },
  { key: "shipped", label: "Shipped", statuses: ["shipped"] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled", "refunded"] },
  { key: "all", label: "All", statuses: null },
] as
const;

type OrderRow = {
  id: string;
  email: string | null;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  order_items: { quantity: number } [] | null;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise < { filter ? : string } > ;
}) {
  const { filter: filterParam } = await searchParams;
  const active = FILTERS.find((f) => f.key === filterParam) ?? FILTERS[0];
  
  const { supabase } = await requireAdmin("/admin/orders");
  
  let query = supabase
    .from("orders")
    .select(
      "id, email, status, total_cents, currency, created_at, order_items(quantity)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  
  if (active.statuses) {
    query = query.in("status", [...active.statuses]);
  }
  
  const { data } = await query;
  const orders = (data ?? []) as unknown as OrderRow[];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Process paid orders and track delivery.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/orders?filter=${f.key}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active.key === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className={`${cardClass} px-6 py-14 text-center`}>
          <p className="font-medium">No orders here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders appear once customers complete checkout.
          </p>
        </div>
      ) : (
        <ul className={`${cardClass} divide-y divide-border`}>
          {orders.map((order) => {
            const itemCount = (order.order_items ?? []).reduce(
              (sum, item) => sum + item.quantity,
              0,
            );

            return (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{orderNumber(order.id)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.email ?? "Guest"} · {formatDate(order.created_at)} ·{" "}
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
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
    </div>
  );
}