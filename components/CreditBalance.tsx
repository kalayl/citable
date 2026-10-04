"use client";

import { useEffect, useState } from "react";

interface Balance {
  credits: number;
  subscription: boolean;
  earlyAccess: boolean;
}

export default function CreditBalance() {
  const [balance, setBalance] = useState<Balance | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setBalance(data))
      .catch(() => {});
  }, []);

  if (!balance) return null;

  if (balance.earlyAccess) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        Early access — free
      </span>
    );
  }

  if (balance.subscription) {
    return (
      <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
        Pro
      </span>
    );
  }

  return (
    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
      {balance.credits} credit{balance.credits === 1 ? "" : "s"}
    </span>
  );
}
