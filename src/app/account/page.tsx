import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Package, Pencil, Shield, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "My account | Vastify",
};

type ProfileRow = {
  full_name: string | null;
  is_admin: boolean;
  avatar_url: string | null;
} | null;
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
      .select("full_name, is_admin, avatar_url")
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
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <User className="size-7" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              Hi, {name}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {profile?.is_admin && (
              <span className="mt-1.5 inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                Admin
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
        <section className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Pencil className="size-5" />
          </span>
          <div>
            <h2 className="font-medium">Profile & addresses</h2>
            <p className="text-sm text-muted-foreground">
              Update your photo, phone number and saved delivery addresses.
            </p>
            <Link href="/account/profile" className={linkClass}>
              Edit profile
            </Link>
          </div>
        </section>

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
              <Link href="/admin" className={linkClass}>
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
              View your order history and delivery tracking.
            </p>
            <Link href="/account/orders" className={linkClass}>
              View my orders
            </Link>
          </div>
        </section>
      </div>

      {/* Seller: a quiet line rather than a big card, so it doesn't compete with buyer features */}
      <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
        {!seller && (
          <>
            Have something to sell?{" "}
            <Link href="/sell" className="text-primary hover:underline">
              Apply to become a seller
            </Link>
            .
          </>
        )}
        {seller?.status === "pending" && (
          <>
            Your seller application for {seller.store_name} is under review.{" "}
            <Link href="/seller" className="text-primary hover:underline">
              View status
            </Link>
            .
          </>
        )}
        {seller?.status === "approved" && (
          <>
            You sell as {seller.store_name}.{" "}
            <Link href="/seller" className="text-primary hover:underline">
              Open seller dashboard
            </Link>
            .
          </>
        )}
        {seller?.status === "suspended" && (
          <>Your seller account is suspended. Please contact support.</>
        )}
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/products" className="text-primary hover:underline">
          Continue shopping
        </Link>
      </p>
    </main>
  );
}
