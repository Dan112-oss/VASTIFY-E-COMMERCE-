import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/seller/product-form";
import { getCategories } from "@/lib/queries/products";
import { categoryOptions, requireApprovedSeller } from "@/lib/queries/seller";

export const metadata: Metadata = {
  title: "Add product | Vastify",
};

export default async function NewProductPage() {
  const { user } = await requireApprovedSeller("/seller/products/new");
  const categories = categoryOptions(await getCategories());

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-32 sm:px-6">
      <Link
        href="/seller"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to dashboard
      </Link>
      <h1 className="mb-6 mt-3 font-display text-3xl font-semibold">
        Add a product
      </h1>

      <ProductForm userId={user.id} categories={categories} />
    </main>
  );
}
