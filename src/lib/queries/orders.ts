import type { Supabase } from "@/lib/queries/admin";

export type MyOrderRow = {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  tracking_number: string | null;
  carrier: string | null;
  order_items: {
    quantity: number;
  }[] | null;
};

export async function getMyOrders(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_cents, currency, created_at, tracking_number, carrier, order_items(quantity)",
    )
    .eq("user_id", userId)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyOrders:", error.message);
    return [];
  }

  return (data ?? []) as unknown as MyOrderRow[];
}

export type MyOrderDetail = Omit<MyOrderRow, "order_items"> & {
  shipping_address: Record<string, string> | null;
  order_items: {
    id: string;
    name: string;
    unit_price_cents: number;
    quantity: number;
  }[];
};

export async function getMyOrderById(
  supabase: Supabase,
  userId: string,
  orderId: string,
) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_cents, currency, created_at, tracking_number, carrier, shipping_address, order_items(id, name, unit_price_cents, quantity)",
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return data as unknown as MyOrderDetail;
}