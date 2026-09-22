import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Server-only Stripe client. Never import this in a client component. */
export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
    stripe = new Stripe(key);
  }
  return stripe;
}
