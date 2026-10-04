import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId, attachSessionCookie } from "@/lib/session";
import { getRecord } from "@/lib/credits";
import { isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { sessionId, isNew } = getOrCreateSessionId(req);
  const record = await getRecord(sessionId);
  const res = NextResponse.json({
    credits: record.credits,
    subscription: record.subscription?.status === "active",
    freeAuditsUsed: record.freeAuditsUsed,
    earlyAccess: !isStripeConfigured(),
  });
  if (isNew) attachSessionCookie(res, sessionId);
  return res;
}
