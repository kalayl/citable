"use client";

import { useRef, useState } from "react";

type Step = "email" | "pin" | "done";

export default function SignInForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setDigits(["", "", "", "", "", ""]);
      setStep("pin");
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(pin: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setDigits(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        return;
      }
      setStep("done");
      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDigit(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    // Support paste of the full code into any box.
    const chars = cleaned.slice(0, 6 - index).split("");
    const next = [...digits];
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    setDigits(next);
    const focusIndex = Math.min(index + chars.length, 5);
    inputsRef.current[focusIndex]?.focus();
    const pin = next.join("");
    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      verify(pin);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <p className="font-hand text-2xl text-accent-600">you&apos;re in!</p>
        <p className="mt-2 text-sm text-gray-500">Signed in as {email}. Redirecting…</p>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div>
        <p className="text-sm text-gray-600">
          We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
        </p>
        <div className="mt-4 flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={6}
              value={d}
              disabled={loading}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-full rounded-lg border border-gray-300 bg-white text-center font-mono text-xl text-gray-900 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
            }}
            className="text-gray-500 underline-offset-2 hover:underline"
          >
            Use a different email
          </button>
          <button
            type="button"
            onClick={() => sendCode()}
            disabled={loading}
            className="text-gray-500 underline-offset-2 hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        </div>
      </div>
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
