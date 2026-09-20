import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/types/product";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type ProductDetail = Product & {
  category_id: string | null;
  category_slug: string | null;
  seller_name: string | null;
  images: { url: string; alt: string | null }[];
};

type CategoryRel = { name: string; slug?: string };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  currency: string;
  category_id?: string | null;
  categories: CategoryRel | CategoryRel[] | null;
  product_images: { url: string; alt?: string | null; sort_order: number }[] | null;
  sellers?: { store_name: string } | { store_name: string }[] | null;
};

const LIST_SELECT =
  "id, name, slug, description, price_cents, currency, categories(name), product_images(url, sort_order)";

const DETAIL_SELECT =
  "id, name, slug, description, price_cents, currency, category_id, categories(name, slug), product_images(url, alt, sort_order), sellers(store_name)";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function sortedImages(row: ProductRow) {
  return [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}

function toProduct(row: ProductRow): Product {
  const category = one(row.categories);
  const firstImage = sortedImages(row)[0];

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

/** Approved, active products with optional category / sort / search */
export async function getProducts(
  opts: {
    categoryIds?: string[];
    sort?: ProductSort;
    search?: string;
    limit?: number;
  } = {},
): Promise<Product[]> {
  const { categoryIds, sort = "newest", search, limit = 48 } = opts;

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select(LIST_SELECT)
      .eq("status", "approved")
      .eq("active", true);

    if (categoryIds && categoryIds.length > 0) {
      query = query.in("category_id", categoryIds);
    }

    const term = search?.replace(/[%_,()]/g, " ").trim().slice(0, 60);
    if (term) {
      query = query.ilike("name", `%${term}%`);
    }

    if (sort === "price_asc") {
      query = query.order("price_cents", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("price_cents", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error("getProducts:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
  } catch (err) {
    console.error("getProducts failed:", err);
    return [];
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getProducts({ limit });
}

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("getCategories:", error.message);
      return [];
    }

    return (data ?? []) as unknown as Category[];
  } catch (err) {
    console.error("getCategories failed:", err);
    return [];
  }
});

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductDetail | null> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("products")
        .select(DETAIL_SELECT)
        .eq("slug", slug)
        .eq("status", "approved")
        .eq("active", true)
        .maybeSingle();

      if (error) {
        console.error("getProductBySlug:", error.message);
        return null;
      }
      if (!data) return null;

      const row = data as unknown as ProductRow;
      const category = one(row.categories);
      const seller = one(row.sellers);

      return {
        ...toProduct(row),
        category_id: row.category_id ?? null,
        category_slug: category?.slug ?? null,
        seller_name: seller?.store_name ?? null,
        images: sortedImages(row).map((img) => ({
          url: img.url,
          alt: img.alt ?? null,
        })),
      };
    } catch (err) {
      console.error("getProductBySlug failed:", err);
      return null;
    }
  },
);
