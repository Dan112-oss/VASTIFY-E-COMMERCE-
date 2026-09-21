import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApplyForm } from "@/components/seller/apply-form";
import { getSellerRow, requireUser } from "@/lib/queries/seller";

export const metadata: Metadata = {
  title: "Sell on Vastify | Vastify",
};

const STEPS = [
  "Apply with your store details.",
  "We review and approve your seller account.",
  "Upload your products with photos. Each one is reviewed before it goes live.",
  "When you make a sale, we handle delivery to the buyer.",
];

export default async function SellPage() {
  const { supabase, user } = await requireUser("/sell");

  const seller = await getSellerRow(supabase, user.id);
  if (seller) redirect("/seller");

  return (
    <main className="mx-auto max-w-xl px-4 pb-16 pt-32 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Sell on Vastify
        </h1>
        <p className="mt-2 text-muted-foreground">
          Reach more buyers without running your own store.
        </p>
      </div>

      <ol className="mb-8 space-y-3">
        {STEPS.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <span className="text-muted-foreground">{step}</span>
          </li>
        ))}
      </ol>

      <ApplyForm />
    </main>
  );
}
