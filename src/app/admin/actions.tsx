"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/queries/admin";

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

// Refresh admin pages plus the public store pages
function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/products");
}

/* ------------------------------ Sellers ------------------------------ */

export async function approveSeller(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/sellers");

  const id = str(formData.get("seller_id"));
  const rate = Number(str(formData.get("commission")));

  if (!id || !Number.isFinite(rate) || rate < 0 || rate > 100) return;

  await supabase
    .from("sellers")
    .update({ status: "approved", commission_rate: rate })
    .eq("id", id);

  refresh();
}

export async function setSellerStatus(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/sellers");

  const id = str(formData.get("seller_id"));
  const status = str(formData.get("status"));

  if (!id || !["approved", "suspended", "pending"].includes(status)) return;

  await supabase.from("sellers").update({ status }).eq("id", id);

  refresh();
}

/* ------------------------------ Products ----------------------------- */

export async function approveProduct(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/products");

  const id = str(formData.get("product_id"));
  if (!id) return;

  await supabase
    .from("products")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", id);

  refresh();
}

export async function rejectProduct(formData: FormData) {
  const { supabase } = await requireAdmin("/admin/products");

  const id = str(formData.get("product_id"));
  const reason = str(formData.get("reason")).slice(0, 300);
  if (!id || !reason) return;

  await supabase
    .from("products")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", id);

  refresh();
}

/* ------------------------------- Orders ------------------------------ */

// Which current statuses each action is allowed from
const ALLOWED_FROM: Record<string, string[]> = {
  processing: ["paid"],
  shipped: ["paid", "processing"],
  delivered: ["shipped"],
  cancelled: ["pending", "paid", "processing"],
};

export async function updateOrder(formData: FormData) {
  const orderId = str(formData.get("order_id"));
  const intent = str(formData.get("intent"));

  const { supabase } = await requireAdmin(`/admin/orders/${orderId}`);
  if (!orderId) return;

  if (intent === "notes") {
    const notes = str(formData.get("admin_notes")).slice(0, 2000);
    await supabase
      .from("orders")
      .update({ admin_notes: notes || null })
      .eq("id", orderId);
    refresh();
    return;
  }

  const allowed = ALLOWED_FROM[intent];
  if (!allowed) return;

  const { data } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  const current = (data as unknown as { status: string } | null)?.status;
  if (!current || !allowed.includes(current)) return;

  const patch: Record<string, string | null> = { status: intent };

  if (intent === "shipped") {
    const carrier = str(formData.get("carrier")).slice(0, 80);
    const tracking = str(formData.get("tracking_number")).slice(0, 120);
    if (!carrier) return;
    patch.carrier = carrier;
    patch.tracking_number = tracking || null;
    patch.shipped_at = new Date().toISOString();
  }

  if (intent === "delivered") {
    patch.delivered_at = new Date().toISOString();
  }

  await supabase.from("orders").update(patch).eq("id", orderId);

  refresh();
}

/* ------------------------- Seller payout tracking --------------------- */

export async function setPayoutStatus(formData: FormData) {
  const orderId = str(formData.get("order_id"));
  const { supabase } = await requireAdmin(`/admin/orders/${orderId}`);

  const itemId = str(formData.get("item_id"));
  const status = str(formData.get("status"));

  if (!itemId || !["paid", "unpaid"].includes(status)) return;

  await supabase
    .from("order_items")
    .update({ payout_status: status })
    .eq("id", itemId);

  refresh();
}
