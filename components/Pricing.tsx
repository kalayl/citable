"use client";

import { useState } from "react";

const CREDIT_PACKS = [
  { id: "credits_10", credits: 10, price: "$10", per: "$1.00/audit" },
  { id: "credits_50", credits: 50, price: "$40", per: "$0.80/audit", popular: true },
  { id: "credits_200", credits: 200, price: "$100", per: "$0.50/audit" },
];

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
    } else {
      setError(data.error || "Checkout failed");
    }
  } catch {
    setError("Network error — please try again");
  }
}

export default function Pricing() {
  const [error, setError] = useState<string | null>(null);

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-3xl font-bold">Pricing</h2>
      <p className="mt-2 text-center text-sm font-medium text-emerald-600">
        Early access: everything free until launch
      </p>

      {error && (
        <p className="mx-auto mt-4 max-w-md rounded-md bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {/* Free */}
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-1 text-3xl font-bold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>1 free audit per domain</li>
            <li>Full LLM score report</li>
            <li>Ranked fixes</li>
          </ul>
        </div>

        {/* Credits */}
        <div className="rounded-2xl border-2 border-neutral-900 p-6">
          <h3 className="text-lg font-semibold">Audit credits</h3>
          <p className="mt-1 text-3xl font-bold">
            from $10
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {CREDIT_PACKS.map((pack) => (
              <li key={pack.id} className="flex items-center justify-between">
                <span>
                  {pack.credits} audits — {pack.price}
                  <span className="ml-1 text-xs text-neutral-500">({pack.per})</span>
                </span>
                <button
                  onClick={() => startCheckout(pack.id, setError)}
                  className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-700"
                >
                  Buy
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold">Pro</h3>
          <p className="mt-1 text-3xl font-bold">
            $29<span className="text-base font-normal text-neutral-500">/mo</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>GitHub PR fixes — we fix it for you</li>
            <li>50 audits per month</li>
            <li>Cancel anytime</li>
          </ul>
          <button
            onClick={() => startCheckout("subscription", setError)}
            className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
