import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId, attachSessionCookie } from "@/lib/session-anon";
import { getRecord } from "@/lib/credits";
import { isStripeConfigured } from "@/lib/stripe";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Sign in required", signinUrl: "/signin" },
      { status: 401 },
    );
  }
  const { sessionId, isNew } = getOrCreateSessionId(req);
  const record = await getRecord(sessionId);
  const res = NextResponse.json({
    credits: record.credits,
    subscription: record.subscription?.status === "active",
    freeAuditsUsed: record.freeAuditsUsed,
    earlyAccess: !isStripeConfigured(),
    email: session.user.email,
  });
  if (isNew) attachSessionCookie(res, sessionId);
  return res;
}
