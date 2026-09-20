import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Store, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { AddToCartPanel } from "@/components/shop/add-to-cart-panel";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProductBySlug, getProducts } from "@/lib/queries/products";
import type { Product } from "@/types/product";

// Refresh cached product pages at most once a minute
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found | Vastify" };

  return {
    title: `${product.name} | Vastify`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = product.category_id
    ? (await getProducts({ categoryIds: [product.category_id], limit: 5 }))
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  // Slim object passed to the client-side cart button
  const cartProduct: Product = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price_cents: product.price_cents,
    currency: product.currency,
    image_url: product.image_url,
    category_name: product.category_name,
    badge: null,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/products" className="hover:text-foreground">
          Shop
        </Link>
        {product.category_name && product.category_slug && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category_slug}`}
              className="hover:text-foreground"
            >
              {product.category_name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            {product.category_name && (
              <p className="text-xs uppercase tracking-widest text-primary">
                {product.category_name}
              </p>
            )}
            <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {product.name}
            </h1>
            {product.seller_name && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="size-4" />
                Sold by {product.seller_name}
              </p>
            )}
          </div>

          <p className="text-3xl font-semibold">
            {formatPrice(product.price_cents, product.currency)}
          </p>

          {product.description && (
            <p className="leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          <AddToCartPanel product={cartProduct} />

          <ul className="mt-2 grid gap-3 border-t border-border pt-5 text-sm">
            <li className="flex items-center gap-3">
              <Truck className="size-4 text-primary" />
              Tracked delivery on every order
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-primary" />
              Secure payments with Stripe
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="size-4 text-primary" />
              Easy returns
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </main>
  );
}
