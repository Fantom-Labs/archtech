import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Defina STRIPE_SECRET_KEY");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}
