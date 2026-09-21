"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProduct, type FormState } from "@/app/seller/actions";
import {
  MAX_IMAGE_MB,
  MAX_PRODUCT_IMAGES,
  STORE_CURRENCY,
} from "@/lib/config";

type Props = {
  userId: string;
  categories: { id: string; label: string }[];
  product?: {
    id: string;
    name: string;
    description: string;
    category_id: string;
    price: string;
    images: string[];
  };
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function ProductForm({ userId, categories, product }: Props) {
  const [state, formAction, pending] = React.useActionState<
    FormState,
    FormData
  >(saveProduct, null);

  const [images, setImages] = React.useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadError(null);

    const room = MAX_PRODUCT_IMAGES - images.length;
    if (room <= 0) {
      setUploadError(`You can add up to ${MAX_PRODUCT_IMAGES} photos.`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of files.slice(0, room)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Please use JPG, PNG or WebP photos.");
        continue;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setUploadError(`Each photo must be under ${MAX_IMAGE_MB} MB.`);
        continue;
      }

      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
        });

      if (error) {
        setUploadError(
          "Upload failed. Check your connection and that your seller account is approved.",
        );
        continue;
      }

      uploaded.push(
        supabase.storage.from("product-images").getPublicUrl(path).data
          .publicUrl,
      );
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function makeMain(index: number) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="product_id" value={product.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      {/* Photos */}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="font-medium">Photos</h2>
          <p className="text-sm text-muted-foreground">
            Add up to {MAX_PRODUCT_IMAGES} photos. The first one is the main
            photo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
            >
              <Image
                src={url}
                alt={`Product photo ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
              >
                <X className="size-4" />
              </button>
              {i === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Main
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(i)}
                  className="absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-black"
                >
                  Make main
                </button>
              )}
            </div>
          ))}

          {images.length < MAX_PRODUCT_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <ImagePlus className="size-6" />
              )}
              <span>{uploading ? "Uploading" : "Add photo"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading}
                onChange={handleFiles}
                className="sr-only"
              />
            </label>
          )}
        </div>

        {uploadError && (
          <p role="alert" className="text-sm text-destructive">
            {uploadError}
          </p>
        )}
      </section>

      {/* Details */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Product name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={product?.name}
            className={`${inputClass} h-11`}
            placeholder="e.g. Handmade leather wallet"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="category_id" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue={product?.category_id ?? ""}
              className={`${inputClass} h-11`}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="price" className="text-sm font-medium">
              Price ({STORE_CURRENCY.toUpperCase()})
            </label>
            <input
              id="price"
              name="price"
              type="text"
              inputMode="decimal"
              required
              defaultValue={product?.price}
              className={`${inputClass} h-11`}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={2000}
            defaultValue={product?.description}
            className={`${inputClass} py-3`}
            placeholder="Materials, size, condition, what's included..."
          />
        </div>
      </section>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending
            ? "Saving..."
            : product
              ? "Save and resubmit for review"
              : "Submit for review"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          New and edited products are reviewed by our team before going live.
        </p>
      </div>
    </form>
  );
}
