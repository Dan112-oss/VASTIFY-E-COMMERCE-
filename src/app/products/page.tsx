import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/components/shop/product-grid";
import {
  getCategories,
  getProducts,
  type ProductSort,
} from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Shop | Vastify",
  description: "Browse all products on Vastify.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(params: { category?: string; sort?: string; q?: string }) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.q) sp.set("q", params.q);
  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card/60 hover:bg-accent",
      )}
    >
      {children}
    </Link>
  );
}

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = (first(sp.q) ?? "").trim().slice(0, 60);
  const sortParam = first(sp.sort);
  const sort: ProductSort =
    sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : "newest";

  const categories = await getCategories();
  const topLevel = categories.filter((c) => !c.parent_id);
  const activeCategory =
    topLevel.find((c) => c.slug === first(sp.category)) ?? null;

  const categoryIds = activeCategory
    ? [
        activeCategory.id,
        ...categories
          .filter((c) => c.parent_id === activeCategory.id)
          .map((c) => c.id),
      ]
    : undefined;

  const products = await getProducts({ categoryIds, sort, search: q });

  const current = { category: activeCategory?.slug, sort, q };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {activeCategory ? activeCategory.name : "Shop"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
          {q ? ` matching "${q}"` : ""}
        </p>
      </div>

      {/* Search (works without JavaScript) */}
      <form action="/products" method="get" className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products"
            className="h-11 w-full rounded-full border border-border bg-card/60 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        {activeCategory && (
          <input type="hidden" name="category" value={activeCategory.slug} />
        )}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <button
          type="submit"
          className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      {/* Categories */}
      <div
        id="categories"
        className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Chip
          href={buildHref({ sort, q })}
          active={!activeCategory}
        >
          All
        </Chip>
        {topLevel.map((cat) => (
          <Chip
            key={cat.id}
            href={buildHref({ category: cat.slug, sort, q })}
            active={activeCategory?.id === cat.id}
          >
            {cat.name}
          </Chip>
        ))}
      </div>

      {/* Sort */}
      <div className="-mx-4 mb-8 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
          Sort
        </span>
        {SORTS.map((s) => (
          <Chip
            key={s.value}
            href={buildHref({ ...current, sort: s.value })}
            active={sort === s.value}
          >
            {s.label}
          </Chip>
        ))}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold">
            No products found
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different search or category.
          </p>
          <Link
            href="/products"
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Clear filters
          </Link>
        </div>
      )}
    </main>
  );
}
