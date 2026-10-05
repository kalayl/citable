"use client";

import { useState } from "react";

async function startCheckout(product: string, setError: (m: string | null) => void) {
  setError(null);
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else if (data.earlyAccess) {
      setError("Early access: everything is free until launch — no payment needed yet.");
    } else if (data.signinUrl) {
      window.location.href = data.signinUrl;
    } else {
      setError(data.error || "Checkout failed");
    }
  } catch {
    setError("Network error — please try again");
  }
}

interface Tier {
  name: string;
  monthly: string;
  monthlySuffix?: string;
  annualMonthly?: string; // effective per-month when billed annually
  annualTotal?: string;
  tagline: string;
  features: string[];
  cta: string;
  product?: { monthly: string; annual: string };
  href?: string;
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    monthly: "$0",
    tagline: "The score is free. Always.",
    features: [
      "Unlimited basic audits",
      "Top 3 fixes per audit",
      "1 site tracked",
      "MCP audit tool (rate-limited)",
      "Community support",
    ],
    cta: "Get your score",
    href: "#top",
  },
  {
    name: "Pro",
    monthly: "$29",
    monthlySuffix: "/mo",
    annualMonthly: "$24",
    annualTotal: "$290/yr",
    tagline: "For builders who want it fixed.",
    features: [
      "Unlimited full audits",
      "Full reports — all issues + fix instructions",
      "Up to 10 GitHub PR fixes/mo (1 repo)",
      "3 sites tracked",
      "Full MCP server (audit / category / fix)",
      "Weekly re-audits + alerts",
      "2 seats · Email support",
    ],
    cta: "Start Pro",
    product: { monthly: "pro", annual: "pro_annual" },
    highlight: true,
  },
  {
    name: "Agency",
    monthly: "$99",
    monthlySuffix: "/mo",
    annualMonthly: "$82.50",
    annualTotal: "$990/yr",
    tagline: "For teams shipping client sites.",
    features: [
      "Everything in Pro",
      "50 GitHub PR fixes/mo (10 repos)",
      "15 sites tracked",
      "Daily re-audits + alerts",
      "White-label reports",
      "10 seats · Priority support",
    ],
    cta: "Start Agency",
    product: { monthly: "agency", annual: "agency_annual" },
  },
  {
    name: "Enterprise",
    monthly: "Custom",
    tagline: "For platforms and large orgs.",
    features: [
      "Unlimited everything",
      "Unlimited PR fixes, SSO, policies",
      "Full MCP server + API",
      "Custom re-audit schedules",
      "White-label reports",
      "Unlimited seats · SLA + onboarding",
    ],
    cta: "Talk to us",
    href: "mailto:hello@llmscore.dev",
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section id="pricing" className="border-b border-gray-200 bg-paper-deep/60">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <p className="font-hand text-xl text-accent-600">
          the score is free — the fix is the product
        </p>
        <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Pricing
        </h2>

        {/* Founding member badge */}
        <div className="sketch-pill mt-5 inline-flex items-center gap-2 bg-accent-600 px-4 py-1.5 text-sm font-medium text-white">
          <span aria-hidden>★</span>
          Founding member: Pro at $19/mo, locked for life — first 200 customers
        </div>

        {/* Annual toggle */}
        <div className="mt-8 flex items-center gap-3 text-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`sketch-pill px-4 py-1.5 font-medium transition ${
              !annual ? "bg-gray-900 text-white" : "bg-white text-gray-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`sketch-pill px-4 py-1.5 font-medium transition ${
              annual ? "bg-gray-900 text-white" : "bg-white text-gray-600"
            }`}
          >
            Annual <span className="font-hand text-accent-500">— 2 months free</span>
          </button>
        </div>

        {error && (
          <p className="sketch-border-soft mt-4 inline-block bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`sketch-card flex flex-col p-6 ${
                tier.highlight ? "border-2 border-accent-600" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-lg font-semibold text-gray-900">
                  {tier.name}
                </h3>
                {tier.highlight && (
                  <span className="font-hand text-sm text-accent-600">
                    most popular
                  </span>
                )}
              </div>
              <p className="mt-2 font-serif text-3xl font-semibold text-gray-900">
                {annual && tier.annualMonthly ? tier.annualMonthly : tier.monthly}
                {tier.monthlySuffix && (
                  <span className="text-base font-normal text-gray-400">
                    {tier.monthlySuffix}
                  </span>
                )}
              </p>
              {annual && tier.annualTotal ? (
                <p className="mt-1 text-xs text-gray-500">
                  billed {tier.annualTotal}
                </p>
              ) : (
                <p className="mt-1 text-xs text-transparent select-none">—</p>
              )}
              <p className="mt-2 font-hand text-base text-accent-600">
                {tier.tagline}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-600">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-accent-500" aria-hidden>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {tier.product ? (
                <button
                  onClick={() =>
                    startCheckout(
                      annual ? tier.product!.annual : tier.product!.monthly,
                      setError
                    )
                  }
                  className="sketch-btn mt-6 w-full bg-accent-600 px-4 py-2.5 text-sm font-medium text-white"
                >
                  {tier.cta}
                </button>
              ) : (
                <a
                  href={tier.href}
                  className={`sketch-btn mt-6 block w-full px-4 py-2.5 text-center text-sm font-medium ${
                    tier.name === "Free"
                      ? "bg-accent-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  {tier.cta}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* $9 side door */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Just need one report?{" "}
          <button
            onClick={() => startCheckout("one_time_report", setError)}
            className="font-medium text-accent-600 underline decoration-dotted underline-offset-2 hover:text-accent-700"
          >
            Unlock a single full report for $9
          </button>{" "}
          — no subscription.
        </p>
      </div>
    </section>
  );
}
