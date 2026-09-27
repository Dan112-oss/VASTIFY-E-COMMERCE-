import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddressBook, type Address } from "@/components/account/address-book";
import { ProfileForm } from "@/components/account/profile-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit profile | Vastify",
};

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/profile");

  const [profileRes, addressesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("addresses")
      .select(
        "id, full_name, line1, line2, city, state, postal_code, country, phone, is_default",
      )
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data as unknown as ProfileRow | null;
  const addresses = (addressesRes.data ?? []) as unknown as Address[];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-32 sm:px-6">
      <Link
        href="/account"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to account
      </Link>
      <h1 className="mb-6 mt-3 font-display text-3xl font-semibold">
        Edit profile
      </h1>

      <div className="space-y-6">
        <ProfileForm
          userId={user.id}
          initialName={profile?.full_name ?? ""}
          initialPhone={profile?.phone ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? null}
        />
        <AddressBook addresses={addresses} />
      </div>
    </main>
  );
}
