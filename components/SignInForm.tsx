"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/",
      });
      if (!res || res.error) {
        setError(res?.error || "Something went wrong");
        return;
      }
      // Auth.js Resend provider sends a magic link to the email.
      setSent(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="font-hand text-2xl text-accent-600">check your inbox</p>
        <p className="mt-2 text-sm text-gray-600">
          We sent a sign-in link to{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Click the link in the email to sign in. It expires in 24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError("");
          }}
          className="mt-4 text-sm text-gray-500 underline-offset-2 hover:underline"
        >
          Use a different email
        </button>
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
        {loading ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
