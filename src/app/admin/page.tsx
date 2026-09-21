import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { cardClass } from "@/components/admin/styles";
import {
  formatDate,
  getAdminCounts,
  orderNumber,
  requireAdmin,
} from "@/lib/queries/admin";
import { formatPrice } from "@/lib/format";
import { STORE_CURRENCY } from "@/lib/config";

type RecentOrder = {
  id: string;
  email: string | null;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin("/admin");

  const [counts, revenueRes, recentRes] = await Promise.all([
    getAdminCounts(supabase),
    supabase
      .from("orders")
      .select("total_cents")
      .in("status", ["paid", "processing", "shipped", "delivered"])
      .limit(5000),
    supabase
      .from("orders")
      .select("id, email, status, total_cents, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const revenue = (
    (revenueRes.data ?? []) as unknown as { total_cents: number }[]
  ).reduce((sum, o) => sum + o.total_cents, 0);

  const recent = (recentRes.data ?? []) as unknown as RecentOrder[];

  const stats = [
    {
      label: "Revenue",
      value: formatPrice(revenue, STORE_CURRENCY),
      href: "/admin/orders?filter=all",
      hint: "Paid orders",
    },
    {
      label: "Orders to process",
      value: String(counts.ordersToProcess),
      href: "/admin/orders",
      hint: "Paid and processing",
    },
    {
      label: "Sellers to approve",
      value: String(counts.pendingSellers),
      href: "/admin/sellers",
      hint: "Waiting for review",
    },
    {
      label: "Products to review",
      value: String(counts.pendingProducts),
      href: "/admin/products",
      hint: "Waiting for review",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What needs your attention right now.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-card p-5 transition-colors hover:bg-accent/50"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders?filter=all"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className={`${cardClass} px-6 py-12 text-center`}>
            <p className="font-medium">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Orders will appear here once customers start checking out.
            </p>
          </div>
        ) : (
          <ul className={`${cardClass} divide-y divide-border`}>
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{orderNumber(order.id)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.email ?? "Guest"} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatPrice(order.total_cents, order.currency)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
