import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getOrCreateSessionId } from "@/lib/session";
import { getRecord } from "@/lib/credits";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not enabled yet", earlyAccess: true },
      { status: 503 },
    );
  }

  const { sessionId } = getOrCreateSessionId(req);
  const record = await getRecord(sessionId);
  const customerId =
    record.stripeCustomerId || record.subscription?.stripeCustomerId;

  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account found for this session" },
      { status: 404 },
    );
  }

  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.nextUrl.origin}/`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Portal session failed";
    console.error("[stripe/portal]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
