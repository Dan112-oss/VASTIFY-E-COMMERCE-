"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_PRODUCT_IMAGES, STORE_CURRENCY } from "@/lib/config";

export type FormState = { error?: string } | null;

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

function shortId() {
  return crypto.randomUUID().slice(0, 6);
}

/* ---------------------------------------------------------- */
/* Seller application                                          */
/* ---------------------------------------------------------- */

export async function applyAsSeller(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const storeName = String(formData.get("store_name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (storeName.length < 2 || storeName.length > 60) {
    return { error: "Store name must be between 2 and 60 characters." };
  }
  if (description.length > 500) {
    return { error: "Description must be 500 characters or fewer." };
  }
  if (phone.length > 30) {
    return { error: "Phone number looks too long." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sell");

  const { error } = await supabase.from("sellers").insert({
    id: user.id,
    store_name: storeName,
    slug: `${slugify(storeName)}-${shortId()}`,
    description: description || null,
    phone: phone || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You have already applied to sell." };
    }
    return { error: "Could not submit your application. Please try again." };
  }

  redirect("/seller");
}

/* ---------------------------------------------------------- */
/* Create or update a product                                  */
/* ---------------------------------------------------------- */

export async function saveProduct(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const productId = String(formData.get("product_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "")
    .replace(",", ".")
    .trim();

  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("images") ?? "[]"));
    if (Array.isArray(parsed)) {
      images = parsed.filter((u): u is string => typeof u === "string");
    }
  } catch {
    images = [];
  }

  if (name.length < 2 || name.length > 120) {
    return { error: "Product name must be between 2 and 120 characters." };
  }
  if (description.length > 2000) {
    return { error: "Description must be 2000 characters or fewer." };
  }
  if (!categoryId) {
    return { error: "Please choose a category." };
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) {
    return { error: "Enter a valid price greater than 0." };
  }
  const priceCents = Math.round(price * 100);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/seller");

  // Photos must be ones this seller uploaded to our storage bucket
  const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/product-images/${user.id}/`;
  if (
    images.length < 1 ||
    images.length > MAX_PRODUCT_IMAGES ||
    images.some((url) => !url.startsWith(allowedPrefix))
  ) {
    return {
      error: `Add between 1 and ${MAX_PRODUCT_IMAGES} product photos.`,
    };
  }

  let id: string;

  if (!productId) {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug: `${slugify(name)}-${shortId()}`,
        description: description || null,
        category_id: categoryId,
        price_cents: priceCents,
        currency: STORE_CURRENCY,
        active: true,
        status: "pending",
        seller_id: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      return {
        error: "Could not save the product. Is your seller account approved?",
      };
    }
    id = (data as unknown as { id: string }).id;
  } else {
    // Editing sends the product back for review
    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        description: description || null,
        category_id: categoryId,
        price_cents: priceCents,
        status: "pending",
        rejection_reason: null,
      })
      .eq("id", productId)
      .eq("seller_id", user.id)
      .select("id");

    if (error || !data || data.length === 0) {
      return { error: "Could not update this product." };
    }
    id = productId;

    await supabase.from("product_images").delete().eq("product_id", id);
  }

  const { error: imageError } = await supabase.from("product_images").insert(
    images.map((url, index) => ({
      product_id: id,
      url,
      alt: name,
      sort_order: index,
    })),
  );

  if (imageError) {
    return {
      error:
        "The product was saved but its photos failed. Open it from your dashboard and add the photos again.",
    };
  }

  redirect("/seller?submitted=1");
}

/* ---------------------------------------------------------- */
/* Delete a product                                            */
/* ---------------------------------------------------------- */

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("product_id") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/seller");

  if (id) {
    await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("seller_id", user.id);
  }

  redirect("/seller");
}
