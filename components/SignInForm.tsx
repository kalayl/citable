"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"email" | "pin">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong");
        return;
      }
      setStep("pin");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("pin", {
        email,
        pin,
        redirect: false,
      });
      if (!res || res.error) {
        setError("Incorrect or expired code. Try again.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "pin") {
    return (
      <form onSubmit={verifyCode}>
        <p className="text-center font-hand text-2xl text-accent-600">check your inbox</p>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
        <label htmlFor="signin-pin" className="mt-4 block text-sm font-medium text-gray-700">
          Enter code
        </label>
        <input
          id="signin-pin"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          placeholder="123456"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] text-gray-900 shadow-sm placeholder:tracking-normal placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || pin.length !== 6}
          className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify & sign in"}
        </button>
        <p className="mt-2 text-center text-xs text-gray-400">
          Code expires in 10 minutes.
        </p>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setPin("");
            setError("");
          }}
          className="mt-3 w-full text-sm text-gray-500 underline-offset-2 hover:underline"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode}>
      <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <input
        id="signin-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email}
        className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send sign-in code"}
      </button>
    </form>
  );
}
