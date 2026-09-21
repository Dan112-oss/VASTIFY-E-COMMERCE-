"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Counts = {
  pendingSellers: number;
  pendingProducts: number;
  ordersToProcess: number;
};

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { href: "/admin/orders", label: "Orders", icon: Package, badge: "ordersToProcess" },
  { href: "/admin/sellers", label: "Sellers", icon: Users, badge: "pendingSellers" },
  { href: "/admin/products", label: "Products", icon: Boxes, badge: "pendingProducts" },
] as
const;

export function AdminNav({
  counts,
  orientation,
}: {
  counts: Counts;
  orientation: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  
  return (
    <nav
      aria-label="Admin"
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {ITEMS.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const count = item.badge ? counts[item.badge] : 0;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
            {count > 0 && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}