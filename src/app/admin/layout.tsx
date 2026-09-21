import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminCounts, requireAdmin } from "@/lib/queries/admin";

export const metadata: Metadata = {
  title: "Admin | Vastify",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = await requireAdmin("/admin");
  const counts = await getAdminCounts(supabase);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-primary/60 bg-primary/10 font-display text-lg font-semibold text-primary">
              V
            </span>
            <span className="font-display text-base font-semibold uppercase tracking-[0.2em]">
              Vastify
            </span>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              View store
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              href="/account"
              className="hidden rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border p-4 lg:block">
          <AdminNav counts={counts} orientation="vertical" />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-b border-border px-4 py-3 lg:hidden">
            <AdminNav counts={counts} orientation="horizontal" />
          </div>
          <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
