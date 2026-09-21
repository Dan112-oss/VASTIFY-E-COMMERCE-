"use client";

import * as React from "react";
import { applyAsSeller, type FormState } from "@/app/seller/actions";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function ApplyForm() {
  const [state, formAction, pending] = React.useActionState<
    FormState,
    FormData
  >(applyAsSeller, null);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="space-y-1.5">
        <label htmlFor="store_name" className="text-sm font-medium">
          Store name
        </label>
        <input
          id="store_name"
          name="store_name"
          type="text"
          required
          maxLength={60}
          className={`${inputClass} h-11`}
          placeholder="e.g. Amina's Boutique"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          What do you sell?
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          className={`${inputClass} py-3`}
          placeholder="Tell us about your products and business"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone number <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          className={`${inputClass} h-11`}
          placeholder="+1 555 123 4567"
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
