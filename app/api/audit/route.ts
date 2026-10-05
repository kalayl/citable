import { NextRequest, NextResponse } from "next/server";
import { runAudit, normalizeUrl } from "@/lib/audit";
import { isStripeConfigured, PRICING_SUMMARY } from "@/lib/stripe";
import { getRecord, canAccessFullReport } from "@/lib/credits";
import { getOrCreateSessionId, attachSessionCookie } from "@/lib/session-anon";
import { trackAuditStarted, trackAuditCompleted } from "@/lib/analytics";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import type { AuditResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Audits are ALWAYS free — no signup, no limit (beyond rate limiting).
 * Free tier gets the score + top 3 fixes; all other issues are returned
 * with `locked: true` and redacted fix instructions. The full report
 * requires the $9 one-time unlock or a Pro+ subscription.
 */

function gateResult(result: AuditResult): AuditResult & { locked: boolean } {
  const top = result.topFixes.slice(0, 3);
  const isTop = (message: string) => top.some((t) => t.message === message);

  const categories = result.categories.map((c) => ({
    ...c,
    issues: c.issues.map((issue) => {
      if (issue.severity === "pass" || isTop(issue.message)) return issue;
      return { ...issue, fix: "", locked: true };
    }),
  }));

  return { ...result, categories, topFixes: top, locked: true };
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "Missing 'url' in body" }, { status: 400 });
  }
  const norm = normalizeUrl(body.url);
  if (!norm) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { sessionId, isNew } = getOrCreateSessionId(req);
  const billingEnabled = isStripeConfigured();

  // Rate limiting (per IP; no-ops when Upstash is not configured).
  const subscribed = billingEnabled
    ? (await getRecord(sessionId)).subscription?.status === "active"
    : false;
  const rl = await checkRateLimit(getClientIp(req), subscribed);
  if (!rl.success) {
    const res = NextResponse.json(
      {
        error:
          "Too many audits — you're limited to a few audits per minute. Please wait a moment and try again.",
        code: "rate_limited",
        retryAfter: rl.reset,
      },
      { status: 429 },
    );
    if (rl.reset) {
      res.headers.set(
        "Retry-After",
        String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))),
      );
    }
    if (isNew) attachSessionCookie(res, sessionId);
    return res;
  }

  await trackAuditStarted(norm.domain, "api", sessionId);

  try {
    const result = await runAudit(body.url);
    await trackAuditCompleted(norm.domain, result.overallScore, sessionId);

    // Early access (Stripe not configured): everything is free, no gating.
    let payload: AuditResult & { locked?: boolean; pricing?: unknown } = result;
    if (billingEnabled) {
      const fullAccess = await canAccessFullReport(sessionId, norm.domain);
      if (!fullAccess) {
        payload = { ...gateResult(result), pricing: PRICING_SUMMARY };
      }
    }

    const res = NextResponse.json(payload);
    if (isNew) attachSessionCookie(res, sessionId);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
