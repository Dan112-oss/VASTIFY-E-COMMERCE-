"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | null;

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/profile");
  return { supabase, userId: user.id };
}

/* ------------------------------ Profile ------------------------------- */

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await requireUserId();

  const fullName = str(formData.get("full_name"));
  const phone = str(formData.get("phone"));
  const avatarUrl = str(formData.get("avatar_url"));

  if (fullName.length < 1 || fullName.length > 80) {
    return { error: "Name must be between 1 and 80 characters." };
  }
  if (phone.length > 30) {
    return { error: "Phone number looks too long." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", userId);

  if (error) {
    return { error: "Could not save your profile. Please try again." };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { error: undefined };
}

/* ---------------------------- Address book ----------------------------- */

function readAddress(formData: FormData) {
  return {
    full_name: str(formData.get("full_name")),
    line1: str(formData.get("line1")),
    line2: str(formData.get("line2")) || null,
    city: str(formData.get("city")),
    state: str(formData.get("state")) || null,
    postal_code: str(formData.get("postal_code")) || null,
    country: str(formData.get("country")),
    phone: str(formData.get("phone")) || null,
  };
}

function validAddress(a: ReturnType<typeof readAddress>) {
  return Boolean(a.full_name && a.line1 && a.city && a.country);
}

export async function addAddress(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await requireUserId();
  const address = readAddress(formData);

  if (!validAddress(address)) {
    return { error: "Please fill in name, address, city and country." };
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { error } = await supabase.from("addresses").insert({
    ...address,
    user_id: userId,
    is_default: (count ?? 0) === 0,
  });

  if (error) {
    return { error: "Could not save this address." };
  }

  revalidatePath("/account/profile");
  return { error: undefined };
}

export async function updateAddress(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase, userId } = await requireUserId();
  const id = str(formData.get("address_id"));
  const address = readAddress(formData);

  if (!id || !validAddress(address)) {
    return { error: "Please fill in name, address, city and country." };
  }

  const { error } = await supabase
    .from("addresses")
    .update(address)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { error: "Could not update this address." };
  }

  revalidatePath("/account/profile");
  return { error: undefined };
}

export async function deleteAddress(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const id = str(formData.get("address_id"));
  if (!id) return;

  await supabase.from("addresses").delete().eq("id", id).eq("user_id", userId);

  revalidatePath("/account/profile");
}

export async function setDefaultAddress(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const id = str(formData.get("address_id"));
  if (!id) return;

  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);

  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath("/account/profile");
}
