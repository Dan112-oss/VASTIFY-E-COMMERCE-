import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout | Vastify",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-32 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold">Checkout</h1>
      <CheckoutForm email={user.email ?? ""} />
    </main>
  );
}
