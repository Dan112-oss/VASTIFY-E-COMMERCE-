import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/seller/product-form";
import { getCategories } from "@/lib/queries/products";
import { categoryOptions, requireApprovedSeller } from "@/lib/queries/seller";

export const metadata: Metadata = {
  title: "Edit product | Vastify",
};

type EditRow = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price_cents: number;
  product_images: { url: string; sort_order: number }[] | null;
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireApprovedSeller(
    `/seller/products/${id}/edit`,
  );

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, description, category_id, price_cents, product_images(url, sort_order)",
    )
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();

  if (!data) notFound();

  const product = data as unknown as EditRow;
  const categories = categoryOptions(await getCategories());

  const images = [...(product.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-32 sm:px-6">
      <Link
        href="/seller"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-6 mt-3 font-display text-3xl font-semibold">
        Edit product
      </h1>

      <ProductForm
        userId={user.id}
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          category_id: product.category_id ?? "",
          price: (product.price_cents / 100).toFixed(2),
          images,
        }}
      />
    </main>
  );
}
