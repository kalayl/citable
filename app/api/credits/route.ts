import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId, attachSessionCookie, requireAuth } from "@/lib/session";
import { getRecord } from "@/lib/credits";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { sessionId, isNew } = getOrCreateSessionId(req);
  const record = await getRecord(sessionId);
  const res = NextResponse.json({
    credits: record.credits,
    subscription: record.subscription?.status === "active",
    freeAuditsUsed: record.freeAuditsUsed,
    earlyAccess: !isStripeConfigured(),
    email: auth.session.email,
  });
  if (isNew) attachSessionCookie(res, sessionId);
  return res;
}
