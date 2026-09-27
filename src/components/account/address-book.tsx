"use client";

import * as React from "react";
import { MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  type FormState,
} from "@/app/account/actions";

export type Address = {
  id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

function AddressForm({
  address,
  onDone,
}: {
  address?: Address;
  onDone: () => void;
}) {
  const action = address ? updateAddress : addAddress;
  const [state, formAction, pending] = React.useActionState<
    FormState,
    FormData
  >(action, null);

  React.useEffect(() => {
    if (state && !state.error) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-background p-4">
      {address && <input type="hidden" name="address_id" value={address.id} />}

      <input
        name="full_name"
        required
        maxLength={120}
        defaultValue={address?.full_name}
        placeholder="Full name"
        className={inputClass}
      />
      <input
        name="line1"
        required
        maxLength={160}
        defaultValue={address?.line1}
        placeholder="Street address"
        className={inputClass}
      />
      <input
        name="line2"
        maxLength={160}
        defaultValue={address?.line2 ?? ""}
        placeholder="Apartment, suite, etc. (optional)"
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="city"
          required
          maxLength={100}
          defaultValue={address?.city}
          placeholder="City"
          className={inputClass}
        />
        <input
          name="state"
          maxLength={100}
          defaultValue={address?.state ?? ""}
          placeholder="State / region"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          name="postal_code"
          maxLength={20}
          defaultValue={address?.postal_code ?? ""}
          placeholder="Postal code"
          className={inputClass}
        />
        <input
          name="country"
          required
          maxLength={60}
          defaultValue={address?.country}
          placeholder="Country"
          className={inputClass}
        />
      </div>
      <input
        name="phone"
        type="tel"
        maxLength={30}
        defaultValue={address?.phone ?? ""}
        placeholder="Phone (optional)"
        className={inputClass}
      />

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save address"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Address book</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Plus className="size-3.5" />
            Add address
          </button>
        )}
      </div>

      {adding && (
        <AddressForm onDone={() => setAdding(false)} />
      )}

      {addresses.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          No saved addresses yet. Add one to speed up checkout.
        </p>
      )}

      <ul className="space-y-3">
        {addresses.map((addr) =>
          editingId === addr.id ? (
            <li key={addr.id}>
              <AddressForm address={addr} onDone={() => setEditingId(null)} />
            </li>
          ) : (
            <li
              key={addr.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">
                    {addr.full_name}{" "}
                    {addr.is_default && (
                      <span className="ml-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ""} {addr.postal_code}
                    <br />
                    {addr.country}
                    {addr.phone ? ` · ${addr.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {!addr.is_default && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="address_id" value={addr.id} />
                    <button
                      type="submit"
                      aria-label="Set as default"
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                    >
                      <Star className="size-4" />
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  onClick={() => setEditingId(addr.id)}
                  aria-label="Edit address"
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Pencil className="size-4" />
                </button>
                <form
                  action={deleteAddress}
                  onSubmit={(e) => {
                    if (!window.confirm("Delete this address?")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="address_id" value={addr.id} />
                  <button
                    type="submit"
                    aria-label="Delete address"
                    className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
