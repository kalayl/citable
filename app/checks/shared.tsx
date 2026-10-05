import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export const SITE_URL = "https://llmscore.io";

export const CHECKS = [
  { slug: "llms-txt", name: "llms.txt" },
  { slug: "llms-full-txt", name: "llms-full.txt" },
  { slug: "json-ld", name: "JSON-LD" },
  { slug: "robots", name: "AI-crawler robots" },
  { slug: "extractability", name: "Extractability" },
  { slug: "sitemap", name: "Sitemap" },
  { slug: "canonicals", name: "Canonicals" },
  { slug: "og-cards", name: "OG / Twitter cards" },
  { slug: "internal-links", name: "Internal linking" },
] as const;

export function checkMetadata(
  slug: string,
  title: string,
  description: string
): Metadata {
  const url = `${SITE_URL}/checks/${slug}`;
  return {
    title: `${title} — LLMScore`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "LLMScore",
      type: "article",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "LLMScore" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export function Annotation({ children }: { children: React.ReactNode }) {
  return <p className="font-hand text-xl text-accent-600">{children}</p>;
}

export function Tldr({ children }: { children: React.ReactNode }) {
  return (
    <div className="sketch-border-soft mt-8 bg-paper-deep/60 p-5">
      <p className="font-hand text-lg text-accent-600">TL;DR</p>
      <p className="mt-2 leading-relaxed text-gray-700">{children}</p>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-gray-600">
        {children}
      </div>
    </section>
  );
}

export function CodePanel({
  label,
  tone = "neutral",
  children,
}: {
  label: string;
  tone?: "good" | "bad" | "neutral";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-700"
      : tone === "bad"
        ? "text-red-600"
        : "text-gray-500";
  return (
    <div className="sketch-card overflow-hidden">
      <div
        className={`border-b border-gray-200 bg-gray-50 px-4 py-2 font-mono text-xs ${toneClass}`}
      >
        {label}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-gray-700">
        {children}
      </pre>
    </div>
  );
}

export function GoodBad({
  good,
  bad,
}: {
  good: React.ReactNode;
  bad: React.ReactNode;
}) {
  return <div className="mt-6 grid gap-6 lg:grid-cols-2">{bad}{good}</div>;
}

export function CheckShell({
  slug,
  annotation,
  h1,
  children,
}: {
  slug: string;
  annotation: string;
  h1: React.ReactNode;
  children: React.ReactNode;
}) {
  const others = CHECKS.filter((c) => c.slug !== slug);
  return (
    <main>
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <LogoMark size={20} />
          <span className="font-serif text-base font-semibold text-gray-900">
            LLMScore
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          Run a free audit →
        </Link>
      </div>

      <article className="mx-auto w-full max-w-3xl px-6 pb-16 pt-10">
        <Annotation>{annotation}</Annotation>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-gray-900 sm:text-[2.75rem] sm:leading-[1.1]">
          {h1}
        </h1>

        {children}

        <div className="sketch-card mt-16 p-6 text-center">
          <p className="font-serif text-xl font-semibold text-gray-900">
            How does your site score on this check?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            LLMScore audits this and eight other categories in under a minute.
            Free, no signup.
          </p>
          <Link
            href="/"
            className="sketch-btn mt-5 inline-block bg-accent-600 px-6 py-3 text-sm font-medium text-white"
          >
            Run this check on your site →
          </Link>
        </div>

        <nav className="mt-14 border-t border-gray-200 pt-8" aria-label="Other checks">
          <p className="font-hand text-lg text-gray-400">
            the other eight checks:
          </p>
          <ul className="mt-4 grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/checks/${c.slug}`}
                  className="text-gray-600 underline decoration-gray-300 underline-offset-4 transition hover:text-accent-600"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>

      <footer className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 border-t border-gray-200 px-6 py-10 text-sm text-gray-400 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoMark size={18} />
          <span>LLMScore — AI search readiness audits</span>
        </div>
        <p>© {new Date().getFullYear()} LLMScore</p>
      </footer>
    </main>
  );
}
