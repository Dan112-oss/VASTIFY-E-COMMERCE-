"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { STORE_CURRENCY } from "@/lib/config";
import {
  cartTotal,
  createPendingOrder,
  priceCartLines,
  type CartLine,
  type ShippingAddress,
} from "@/lib/queries/checkout";

export type CheckoutState = { error?: string } | null;

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createCheckoutSession(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/checkout");

  // Cart items sent as JSON: [{ id, quantity }, ...]
  let cartLines: CartLine[] = [];
  try {
    const parsed = JSON.parse(str(formData.get("cart")) || "[]");
    if (Array.isArray(parsed)) cartLines = parsed;
  } catch {
    return { error: "Your cart looks corrupted. Please refresh and try again." };
  }

  if (cartLines.length === 0) {
    return { error: "Your cart is empty." };
  }

  const address: ShippingAddress = {
    full_name: str(formData.get("full_name")),
    line1: str(formData.get("line1")),
    line2: str(formData.get("line2")) || undefined,
    city: str(formData.get("city")),
    state: str(formData.get("state")) || undefined,
    postal_code: str(formData.get("postal_code")) || undefined,
    country: str(formData.get("country")),
    phone: str(formData.get("phone")) || undefined,
  };

  if (!address.full_name || !address.line1 || !address.city || !address.country) {
    return { error: "Please fill in your full name, address, city and country." };
  }

  // Re-price every item from the database; never trust prices from the browser
  const priced = await priceCartLines(cartLines);

  if (priced.length === 0) {
    return {
      error: "None of the items in your cart are available anymore.",
    };
  }
  if (priced.length < cartLines.length) {
    return {
      error:
        "One or more items in your cart are no longer available. Please review your cart and try again.",
    };
  }

  const email = user.email ?? str(formData.get("email"));
  if (!email) {
    return { error: "We need an email address for your order." };
  }

  let orderId: string;
  try {
    const result = await createPendingOrder({
      userId: user.id,
      email,
      lines: priced,
      address,
    });
    orderId = result.orderId;
  } catch {
    return { error: "Could not start checkout. Please try again." };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const stripe = getStripe();

  let sessionUrl: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: orderId,
      line_items: priced.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: STORE_CURRENCY,
          unit_amount: l.unitPriceCents,
          product_data: { name: l.name },
        },
      })),
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cart`,
      metadata: { order_id: orderId },
    });
    sessionUrl = session.url;

    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);
  } catch {
    const admin = createAdminClient();
    await admin.from("orders").delete().eq("id", orderId);
    return { error: "Could not connect to Stripe. Please try again." };
  }

  if (!sessionUrl) {
    return { error: "Could not start checkout. Please try again." };
  }

  redirect(sessionUrl);
}
