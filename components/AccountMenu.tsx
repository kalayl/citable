"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface Balance {
  credits: number;
  subscription: boolean;
  earlyAccess: boolean;
}

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = session?.user?.email;
  const signedIn = status === "authenticated" && !!email;

  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => b && setBalance(b))
      .catch(() => {});
  }, [signedIn]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (status === "loading") return null;

  if (!signedIn) {
    return (
      <a
        href="/signin"
        className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-gray-900"
      >
        Sign in
      </a>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 shadow-sm transition hover:border-gray-400"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        <span className="max-w-[180px] truncate">{email}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="sketch-card absolute right-0 top-full z-50 mt-2 w-60 bg-white p-2 text-sm shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate font-medium text-gray-900">{email}</p>
            {balance && (
              <p className="mt-1 text-xs text-gray-500">
                {balance.earlyAccess
                  ? "Early access — free"
                  : balance.subscription
                    ? "Pro subscription"
                    : `${balance.credits} credit${balance.credits === 1 ? "" : "s"}`}
              </p>
            )}
          </div>
          <a
            href="/#pricing"
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Credits &amp; pricing
          </a>
          <a
            href="/#pricing"
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Subscription
          </a>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full rounded px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
