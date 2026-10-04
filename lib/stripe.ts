import Stripe from "stripe";

/**
 * Stripe client + helpers.
 *
 * Graceful degradation: if STRIPE_SECRET_KEY is not set we are in
 * "early access" mode — all audits are free and checkout endpoints
 * return a friendly message instead of erroring.
 */

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }
  return _stripe;
}

export type CreditPackId = "credits_10" | "credits_50" | "credits_200";
export type CheckoutProduct = CreditPackId | "subscription";

export interface CreditPack {
  id: CreditPackId;
  credits: number;
  priceUsd: number;
  envVar: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "credits_10", credits: 10, priceUsd: 10, envVar: "STRIPE_PRICE_CREDITS_10" },
  { id: "credits_50", credits: 50, priceUsd: 40, envVar: "STRIPE_PRICE_CREDITS_50" },
  { id: "credits_200", credits: 200, priceUsd: 100, envVar: "STRIPE_PRICE_CREDITS_200" },
];

export const SUBSCRIPTION = {
  priceUsd: 29,
  monthlyCredits: 50,
  envVar: "STRIPE_PRICE_SUBSCRIPTION",
};

export function getPriceId(product: CheckoutProduct): string | null {
  if (product === "subscription") {
    return process.env[SUBSCRIPTION.envVar] || null;
  }
  const pack = CREDIT_PACKS.find((p) => p.id === product);
  if (!pack) return null;
  return process.env[pack.envVar] || null;
}

export function getPackByPriceId(priceId: string): CreditPack | null {
  for (const pack of CREDIT_PACKS) {
    if (process.env[pack.envVar] === priceId) return pack;
  }
  return null;
}

export function getPackById(id: string): CreditPack | null {
  return CREDIT_PACKS.find((p) => p.id === id) || null;
}

/** Pricing summary used in 402 responses and the pricing UI. */
export const PRICING_SUMMARY = {
  free: "1 free audit per domain",
  credits: CREDIT_PACKS.map((p) => ({
    id: p.id,
    credits: p.credits,
    priceUsd: p.priceUsd,
  })),
  subscription: {
    priceUsd: SUBSCRIPTION.priceUsd,
    description: `GitHub PR fixes + ${SUBSCRIPTION.monthlyCredits} audits/month`,
  },
};
