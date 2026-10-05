import { PostHog } from "posthog-node";

/**
 * Server-side PostHog analytics.
 * Gracefully no-ops when NEXT_PUBLIC_POSTHOG_KEY is not configured (early access).
 */

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || key.includes("PLACEHOLDER")) return null;
  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

async function capture(
  event: string,
  properties: Record<string, unknown>,
  distinctId?: string,
) {
  try {
    const ph = getClient();
    if (!ph) return;
    ph.capture({
      distinctId: distinctId || "server",
      event,
      properties,
    });
    await ph.flush();
  } catch (e) {
    // Analytics must never break the app.
    console.warn("[analytics]", e instanceof Error ? e.message : e);
  }
}

export async function trackAuditStarted(
  domain: string,
  source: string,
  distinctId?: string,
) {
  await capture("audit_started", { domain, source }, distinctId);
}

export async function trackAuditCompleted(
  domain: string,
  score: number,
  distinctId?: string,
) {
  await capture("audit_completed", { domain, score }, distinctId);
}

export async function trackSignIn(provider: string, distinctId?: string) {
  await capture("sign_in", { provider }, distinctId);
}

export async function trackGitHubConnect(repo: string, distinctId?: string) {
  await capture("github_connect", { repo }, distinctId);
}

export async function trackFixPR(
  domain: string,
  category: string,
  prUrl: string,
  distinctId?: string,
) {
  await capture("fix_pr_opened", { domain, category, prUrl }, distinctId);
}

export async function trackCheckout(product: string, distinctId?: string) {
  await capture("checkout_started", { product }, distinctId);
}
