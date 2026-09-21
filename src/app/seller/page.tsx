import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DeleteProductButton } from "@/components/seller/delete-product-button";
import { getSellerRow, requireUser } from "@/lib/queries/seller";

export const metadata: Metadata = {
  title: "Seller dashboard | Vastify",
};

type SellerProduct = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  status: "draft" | "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  product_images: { url: string; sort_order: number }[] | null;
};

const STATUS_LABEL: Record<SellerProduct["status"], string> = {
  draft: "Draft",
  pending: "In review",
  approved: "Live",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<SellerProduct["status"], string> = {
  draft: "border-border text-muted-foreground",
  pending: "border-primary/40 bg-primary/10 text-primary",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

export default async function SellerPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const { supabase, user } = await requireUser("/seller");

  const seller = await getSellerRow(supabase, user.id);
  if (!seller) redirect("/sell");

  if (seller.status === "pending") {
    return (
      <main className="mx-auto max-w-xl px-4 pb-16 pt-32 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Application under review
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Thanks for applying with <strong>{seller.store_name}</strong>. We
            will approve your seller account soon, and then you can start
            adding products.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to my account
          </Link>
        </div>
      </main>
    );
  }

  if (seller.status === "suspended") {
    return (
      <main className="mx-auto max-w-xl px-4 pb-16 pt-32 sm:px-6">
        <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">
            Seller account suspended
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your seller account is currently suspended. Please contact support
            for details.
          </p>
        </div>
      </main>
    );
  }

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, price_cents, currency, status, rejection_reason, product_images(url, sort_order)",
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const products = (data ?? []) as unknown as SellerProduct[];

  const live = products.filter((p) => p.status === "approved").length;
  const inReview = products.filter((p) => p.status === "pending").length;
  const rejected = products.filter((p) => p.status === "rejected").length;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">
            Seller dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold">
            {seller.store_name}
          </h1>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add product
        </Link>
      </div>

      {submitted && (
        <p
          role="status"
          className="mb-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
        >
          Submitted. We&apos;ll review your product and it will go live once
          approved.
        </p>
      )}

      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          { label: "Live", value: live },
          { label: "In review", value: inReview },
          { label: "Rejected", value: rejected },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-4 text-center"
          >
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold">Your products</h2>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <p className="font-medium">No products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first product to start selling.
          </p>
          <Link
            href="/seller/products/new"
            className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Add product
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => {
            const image = [...(product.product_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order,
            )[0];

            return (
              <li
                key={product.id}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center font-display text-2xl text-primary/40">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-medium">{product.name}</h3>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                          STATUS_STYLE[product.status],
                        )}
                      >
                        {STATUS_LABEL[product.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price_cents, product.currency)}
                    </p>
                    {product.status === "rejected" &&
                      product.rejection_reason && (
                        <p className="mt-1 text-xs text-destructive">
                          Reason: {product.rejection_reason}
                        </p>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                    {product.status === "approved" && (
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View in store
                      </Link>
                    )}
                    <div className="ml-auto">
                      <DeleteProductButton
                        productId={product.id}
                        name={product.name}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Sales and payouts will appear here once checkout is live.
      </p>
    </main>
  );
}
