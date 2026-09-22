import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORE_CURRENCY } from "@/lib/config";

export type CartLine = { id: string; quantity: number };

export type PricedLine = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  sellerId: string | null;
  commissionRate: number;
};

type ProductRow = {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
  seller_id: string | null;
  sellers: { commission_rate: number | string } | { commission_rate: number | string }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

/**
 * Looks up each cart product in the database (ignoring any price the
 * browser sent) so a customer can never pay less than the real price.
 * Only approved, active products can be bought.
 */
export async function priceCartLines(lines: CartLine[]): Promise<PricedLine[]> {
  const cleaned = lines
    .filter((l) => l.id && Number.isFinite(l.quantity))
    .map((l) => ({ id: l.id, quantity: Math.min(Math.max(1, Math.floor(l.quantity)), 99) }));

  if (cleaned.length === 0) return [];

  const supabase = createPublicClient();
  const ids = [...new Set(cleaned.map((l) => l.id))];

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price_cents, currency, seller_id, sellers(commission_rate)")
    .in("id", ids)
    .eq("status", "approved")
    .eq("active", true);

  if (error || !data) return [];

  const byId = new Map((data as unknown as ProductRow[]).map((p) => [p.id, p]));

  const priced: PricedLine[] = [];
  for (const line of cleaned) {
    const product = byId.get(line.id);
    if (!product) continue; // no longer available; silently skip

    priced.push({
      productId: product.id,
      name: product.name,
      unitPriceCents: product.price_cents,
      quantity: line.quantity,
      sellerId: product.seller_id,
      commissionRate: Number(one(product.sellers)?.commission_rate ?? 0),
    });
  }

  return priced;
}

export function cartTotal(lines: PricedLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
}

export type ShippingAddress = {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
};

/** Creates the pending order and its line items. Uses the admin client since buyers have no insert policy on these tables. */
export async function createPendingOrder(params: {
  userId: string;
  email: string;
  lines: PricedLine[];
  address: ShippingAddress;
}) {
  const admin = createAdminClient();
  const total = cartTotal(params.lines);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: params.userId,
      email: params.email,
      status: "pending",
      total_cents: total,
      currency: STORE_CURRENCY,
      shipping_address: params.address,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error("Could not create the order");
  }

  const orderId = (order as unknown as { id: string }).id;

  const { error: itemsError } = await admin.from("order_items").insert(
    params.lines.map((l) => ({
      order_id: orderId,
      product_id: l.productId,
      name: l.name,
      unit_price_cents: l.unitPriceCents,
      quantity: l.quantity,
      seller_id: l.sellerId,
      commission_rate: l.commissionRate,
    })),
  );

  if (itemsError) {
    await admin.from("orders").delete().eq("id", orderId);
    throw new Error("Could not save the order items");
  }

  return { orderId, total };
}
