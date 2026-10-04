import { NextRequest, NextResponse } from "next/server";
import { runAudit, normalizeUrl } from "@/lib/audit";
import { isStripeConfigured, PRICING_SUMMARY } from "@/lib/stripe";
import {
  getRecord,
  hasFreeAudit,
  markFreeAudit,
  deductCredit,
} from "@/lib/credits";
import { getOrCreateSessionId, attachSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  // Gating (skipped entirely in early access when Stripe is not configured).
  let usedFreeAudit = false;
  let usedCredit = false;
  if (billingEnabled) {
    const record = await getRecord(sessionId);
    const subscribed = record.subscription?.status === "active";
    if (!subscribed) {
      const freeUsed = await hasFreeAudit(sessionId, norm.domain);
      if (!freeUsed) {
        usedFreeAudit = true;
      } else if (record.credits > 0) {
        usedCredit = true;
      } else {
        const res = NextResponse.json(
          {
            error: "Free audit used for this domain",
            code: "payment_required",
            pricing: PRICING_SUMMARY,
          },
          { status: 402 },
        );
        if (isNew) attachSessionCookie(res, sessionId);
        return res;
      }
    }
  }

  try {
    const result = await runAudit(body.url);
    // Deduct only after a successful audit.
    if (usedFreeAudit) await markFreeAudit(sessionId, norm.domain);
    if (usedCredit) await deductCredit(sessionId, `Audit ${norm.domain}`);
    const res = NextResponse.json(result);
    if (isNew) attachSessionCookie(res, sessionId);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
