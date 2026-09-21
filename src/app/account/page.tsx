import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Package, Store, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "My account | Vastify",
};

type ProfileRow = { full_name: string | null; is_admin: boolean } | null;
type SellerRow = { store_name: string; status: string } | null;

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const [profileRes, sellerRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, is_admin")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("sellers")
      .select("store_name, status")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileRes.data as unknown as ProfileRow;
  const seller = sellerRes.data as unknown as SellerRow;

  const name = profile?.full_name || user.email?.split("@")[0] || "there";

  const linkClass =
    "mt-3 inline-block rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-accent";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-32 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Hi, {name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile?.is_admin && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Admin
              </span>
            )}
            {seller && (
              <span className="rounded-full border border-border px-3 py-1 text-xs font-medium capitalize">
                Seller: {seller.status}
              </span>
            )}
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {profile?.is_admin && (
          <section className="flex items-start gap-4 rounded-2xl border border-primary/30 bg-card p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="size-5" />
            </span>
            <div>
              <h2 className="font-medium">Admin panel</h2>
              <p className="text-sm text-muted-foreground">
                Approve sellers and products, and process orders for delivery.
              </p>
              <Link
                href="/admin"
                className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open admin panel
              </Link>
            </div>
          </section>
        )}

        <section className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Package className="size-5" />
          </span>
          <div>
            <h2 className="font-medium">My orders</h2>
            <p className="text-sm text-muted-foreground">
              Your order history and delivery tracking will appear here once
              checkout is live.
            </p>
          </div>
        </section>

        <section className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="size-5" />
          </span>
          <div>
            <h2 className="font-medium">Sell on Vastify</h2>
            {!seller && (
              <>
                <p className="text-sm text-muted-foreground">
                  Want to sell your products here? Apply for a seller account.
                </p>
                <Link href="/sell" className={linkClass}>
                  Apply to sell
                </Link>
              </>
            )}
            {seller?.status === "pending" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Your application for {seller.store_name} is under review.
                </p>
                <Link href="/seller" className={linkClass}>
                  View status
                </Link>
              </>
            )}
            {seller?.status === "approved" && (
              <>
                <p className="text-sm text-muted-foreground">
                  {seller.store_name} is approved. Manage your products and
                  listings.
                </p>
                <Link href="/seller" className={linkClass}>
                  Open seller dashboard
                </Link>
              </>
            )}
            {seller?.status === "suspended" && (
              <p className="text-sm text-muted-foreground">
                Your seller account is suspended. Please contact support.
              </p>
            )}
          </div>
        </section>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link href="/products" className="text-primary hover:underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
