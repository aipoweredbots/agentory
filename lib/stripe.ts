import Stripe from "stripe";
import type { Plan } from "@/lib/db-types";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia"
    });
  }

  return stripeClient;
}

export function getStripePriceId(plan: Plan) {
  if (plan === "FREE") {
    return null;
  }

  if (plan === "PREMIUM") {
    return process.env.STRIPE_PRICE_PREMIUM || null;
  }

  return process.env.STRIPE_PRICE_PREMIUM_PLUS || null;
}
