import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import AuthButtons from "@/components/AuthButtons";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — LLMScore",
  description: "Sign in to LLMScore to manage credits, subscriptions and fixes.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900">
          <LogoMark size={20} />
          <span className="font-serif text-base font-semibold text-gray-900">LLMScore</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          <p className="font-hand text-xl text-accent-600">welcome back, cartographer</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-gray-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Access your credits, subscription and one-click fixes.
          </p>

          <div className="sketch-card mt-8 p-6">
            <AuthButtons />

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <SignInForm />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Your first audit per domain is free — no account needed.{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-gray-600">
              Run an audit
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
