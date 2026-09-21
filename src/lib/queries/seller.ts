import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/queries/products";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type SellerRow = {
  id: string;
  store_name: string;
  status: "pending" | "approved" | "suspended";
};

/** Redirects to login when the visitor isn't signed in */
export async function requireUser(nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  return { supabase, user };
}

export async function getSellerRow(
  supabase: Supabase,
  userId: string,
): Promise<SellerRow | null> {
  const { data } = await supabase
    .from("sellers")
    .select("id, store_name, status")
    .eq("id", userId)
    .maybeSingle();

  return (data as unknown as SellerRow | null) ?? null;
}

/** Only approved sellers may continue; everyone else is redirected */
export async function requireApprovedSeller(nextPath: string) {
  const { supabase, user } = await requireUser(nextPath);
  const seller = await getSellerRow(supabase, user.id);

  if (!seller) redirect("/sell");
  if (seller.status !== "approved") redirect("/seller");

  return { supabase, user, seller };
}

/** Dropdown options like "Fashion" and "Fashion › Shoes" */
export function categoryOptions(categories: Category[]) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return categories
    .map((c) => {
      const parent = c.parent_id ? byId.get(c.parent_id) : null;
      return {
        id: c.id,
        label: parent ? `${parent.name} › ${c.name}` : c.name,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}
