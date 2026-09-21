import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  btnDanger,
  btnPrimary,
  cardClass,
  inputClass,
} from "@/components/admin/styles";
import { formatDate, one, requireAdmin } from "@/lib/queries/admin";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { approveProduct, rejectProduct } from "@/app/admin/actions";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Live" },
  { key: "rejected", label: "Rejected" },
] as
const;

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  categories: { name: string } | { name: string } [] | null;
  sellers: { store_name: string } | { store_name: string } [] | null;
  product_images: { url: string;sort_order: number } [] | null;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise < { status ? : string } > ;
}) {
  const { status: statusParam } = await searchParams;
  const status = TABS.some((t) => t.key === statusParam) ?
    (statusParam as string) :
    "pending";
  
  const { supabase } = await requireAdmin("/admin/products");
  
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price_cents, currency, status, rejection_reason, created_at, categories(name), sellers(store_name), product_images(url, sort_order)",
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  
  const products = (data ?? []) as unknown as ProductItem[];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review seller listings before they go live.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/products?status=${tab.key}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              status === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className={`${cardClass} px-6 py-14 text-center`}>
          <p className="font-medium">
            Nothing here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No {status === "approved" ? "live" : status} products.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => {
            const image = [...(product.product_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order,
            )[0];
            const category = one(product.categories)?.name;
            const seller = one(product.sellers)?.store_name ?? "Vastify";

            return (
              <li key={product.id} className={`${cardClass} p-5`}>
                <div className="flex gap-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center font-display text-3xl text-primary/40">
                        {product.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{product.name}</h2>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold">
                      {formatPrice(product.price_cents, product.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[category, `Seller: ${seller}`, formatDate(product.created_at)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>

                {product.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {product.status === "rejected" && product.rejection_reason && (
                  <p className="mt-3 text-sm text-destructive">
                    Reason: {product.rejection_reason}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {product.status !== "approved" && (
                    <form action={approveProduct}>
                      <input type="hidden" name="product_id" value={product.id} />
                      <button type="submit" className={btnPrimary}>
                        Approve
                      </button>
                    </form>
                  )}

                  {product.status !== "rejected" && (
                    <form action={rejectProduct} className="flex flex-1 items-end gap-2">
                      <input type="hidden" name="product_id" value={product.id} />
                      <input
                        name="reason"
                        required
                        maxLength={300}
                        placeholder="Reason for rejecting"
                        className={cn(inputClass, "min-w-40 flex-1")}
                      />
                      <button type="submit" className={btnDanger}>
                        Reject
                      </button>
                    </form>
                  )}

                  {product.status === "approved" && (
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View in store
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}