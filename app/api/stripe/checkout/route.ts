import { NextRequest, NextResponse } from "next/server";
import {
  getStripe,
  isStripeConfigured,
  getPriceId,
  getProductById,
  type CheckoutProduct,
} from "@/lib/stripe";
import { getOrCreateSessionId, attachSessionCookie } from "@/lib/session-anon";
import { auth } from "@/auth";
import { trackCheckout } from "@/lib/analytics";

export const runtime = "nodejs";

const VALID_PRODUCTS: CheckoutProduct[] = [
  "one_time_report",
  "pro",
  "pro_annual",
  "agency",
  "agency_annual",
  "founding_pro",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Sign in required", signinUrl: "/signin" },
      { status: 401 },
    );
  }

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
  const productDef = getProductById(product)!;
  const isSubscription = productDef.mode === "subscription";

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
        plan: productDef.plan ?? "",
      },
      subscription_data: isSubscription
        ? { metadata: { llmscore_session: sessionId } }
        : undefined,
    });

    await trackCheckout(product, session.user.email);

    const res = NextResponse.json({ url: checkout.url });
    if (isNew) attachSessionCookie(res, sessionId);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
