import { NextRequest, NextResponse } from "next/server";
import {
  getStripe,
  isStripeConfigured,
  getPriceId,
  getPackById,
  type CheckoutProduct,
} from "@/lib/stripe";
import { getOrCreateSessionId, attachSessionCookie, requireAuth } from "@/lib/session";

export const runtime = "nodejs";

const VALID_PRODUCTS: CheckoutProduct[] = [
  "credits_10",
  "credits_50",
  "credits_200",
  "subscription",
];

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "Payments are not enabled yet",
        earlyAccess: true,
        message: "Early access: everything is free until launch.",
      },
      { status: 503 },
    );
  }

  let body: { product?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const product = body.product as CheckoutProduct;
  if (!product || !VALID_PRODUCTS.includes(product)) {
    return NextResponse.json(
      { error: `Invalid product. One of: ${VALID_PRODUCTS.join(", ")}` },
      { status: 400 },
    );
  }

  const priceId = getPriceId(product);
  if (!priceId) {
    return NextResponse.json(
      { error: `Price not configured for ${product}` },
      { status: 503 },
    );
  }

  const { sessionId, isNew } = getOrCreateSessionId(req);
  const origin = req.nextUrl.origin;
  const isSubscription = product === "subscription";
  const pack = isSubscription ? null : getPackById(product);

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=canceled`,
      metadata: {
        llmscore_session: sessionId,
        product,
        credits: pack ? String(pack.credits) : "0",
      },
      subscription_data: isSubscription
        ? { metadata: { llmscore_session: sessionId } }
        : undefined,
    });

    const res = NextResponse.json({ url: checkout.url });
    if (isNew) attachSessionCookie(res, sessionId);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
