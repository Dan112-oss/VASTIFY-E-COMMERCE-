import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/types/product";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  categories: { name: string } | { name: string }[] | null;
  product_images: { url: string; sort_order: number }[] | null;
};

const PRODUCT_SELECT =
  "id, name, slug, description, price_cents, currency, categories(name), product_images(url, sort_order)";

function toProduct(row: ProductRow): Product {
  const category = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;
  const firstImage = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  )[0];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price_cents: row.price_cents,
    currency: row.currency,
    image_url: firstImage?.url ?? null,
    category_name: category?.name ?? null,
    badge: null,
  };
}

/** Newest approved, active products */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "approved")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getFeaturedProducts:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
  } catch (err) {
    console.error("getFeaturedProducts failed:", err);
    return [];
  }
}
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/types/product";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  categories: { name: string } | { name: string }[] | null;
  product_images: { url: string; sort_order: number }[] | null;
};

const PRODUCT_SELECT =
  "id, name, slug, description, price_cents, currency, categories(name), product_images(url, sort_order)";

function toProduct(row: ProductRow): Product {
  const category = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;
  const firstImage = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  )[0];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price_cents: row.price_cents,
    currency: row.currency,
    image_url: firstImage?.url ?? null,
    category_name: category?.name ?? null,
    badge: null,
  };
}

/** Newest approved, active products */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "approved")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getFeaturedProducts:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
  } catch (err) {
    console.error("getFeaturedProducts failed:", err);
    return [];
  }
}
