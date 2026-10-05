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

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export type Plan = "free" | "pro" | "agency" | "enterprise" | "founding_pro";
export type PLAN = Plan;

export interface PlanLimits {
  /** Max GitHub PR fixes per month. Infinity = unlimited. */
  prFixesPerMonth: number;
  /** Max tracked sites. Infinity = unlimited. */
  trackedSites: number;
  /** Full per-category report (all issues + fix instructions). */
  fullReport: boolean;
  /** White-label reports. */
  whiteLabel: boolean;
  seats: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { prFixesPerMonth: 0, trackedSites: 1, fullReport: false, whiteLabel: false, seats: 1 },
  pro: { prFixesPerMonth: 10, trackedSites: 3, fullReport: true, whiteLabel: false, seats: 2 },
  founding_pro: { prFixesPerMonth: 10, trackedSites: 3, fullReport: true, whiteLabel: false, seats: 2 },
  agency: { prFixesPerMonth: 50, trackedSites: 15, fullReport: true, whiteLabel: true, seats: 10 },
  enterprise: {
    prFixesPerMonth: Infinity,
    trackedSites: Infinity,
    fullReport: true,
    whiteLabel: true,
    seats: Infinity,
  },
};

// ---------------------------------------------------------------------------
// Products / prices
// ---------------------------------------------------------------------------

export type CheckoutProduct =
  | "one_time_report" // $9 one-time full report unlock
  | "pro" // $29/mo
  | "pro_annual" // $290/yr (2 months free)
  | "agency" // $99/mo
  | "agency_annual" // $990/yr (2 months free)
  | "founding_pro"; // $19/mo, first 200 customers, locked for life

export interface Product {
  id: CheckoutProduct;
  priceUsd: number;
  mode: "payment" | "subscription";
  plan: Plan | null;
  envVar: string;
  label: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "one_time_report",
    priceUsd: 9,
    mode: "payment",
    plan: null,
    envVar: "STRIPE_PRICE_ONE_TIME_REPORT",
    label: "One-time full report unlock",
  },
  {
    id: "pro",
    priceUsd: 29,
    mode: "subscription",
    plan: "pro",
    envVar: "STRIPE_PRICE_PRO",
    label: "Pro — $29/mo",
  },
  {
    id: "pro_annual",
    priceUsd: 290,
    mode: "subscription",
    plan: "pro",
    envVar: "STRIPE_PRICE_PRO_ANNUAL",
    label: "Pro annual — $290/yr",
  },
  {
    id: "agency",
    priceUsd: 99,
    mode: "subscription",
    plan: "agency",
    envVar: "STRIPE_PRICE_AGENCY",
    label: "Agency — $99/mo",
  },
  {
    id: "agency_annual",
    priceUsd: 990,
    mode: "subscription",
    plan: "agency",
    envVar: "STRIPE_PRICE_AGENCY_ANNUAL",
    label: "Agency annual — $990/yr",
  },
  {
    id: "founding_pro",
    priceUsd: 19,
    mode: "subscription",
    plan: "founding_pro",
    envVar: "STRIPE_PRICE_FOUNDING_PRO",
    label: "Founding member Pro — $19/mo for life",
  },
];

/** First N Pro signups qualify for founding member pricing. */
export const FOUNDING_MEMBER_CAP = 200;

export function getProductById(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function getPriceId(product: CheckoutProduct): string | null {
  const p = getProductById(product);
  if (!p) return null;
  return process.env[p.envVar] || null;
}

export function getProductByPriceId(priceId: string): Product | null {
  for (const p of PRODUCTS) {
    if (process.env[p.envVar] === priceId) return p;
  }
  return null;
}

/** Pricing summary used in 402 responses and the pricing UI. */
export const PRICING_SUMMARY = {
  free: "Unlimited audits — score + top 3 fixes, always free",
  oneTimeReport: { priceUsd: 9, description: "Unlock one full report" },
  pro: {
    priceUsd: 29,
    annualPriceUsd: 290,
    description: "Full reports, 10 GitHub PR fixes/mo, 3 tracked sites",
  },
  foundingPro: {
    priceUsd: 19,
    description: `Pro at $19/mo locked for life — first ${FOUNDING_MEMBER_CAP} customers`,
  },
  agency: {
    priceUsd: 99,
    annualPriceUsd: 990,
    description: "Full reports, 50 PR fixes/mo, 15 tracked sites, white-label",
  },
  enterprise: { description: "Custom — unlimited everything, SSO, SLA" },
};
