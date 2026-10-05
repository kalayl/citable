import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured, type Plan } from "@/lib/stripe";
import {
  setPlan,
  unlockReport,
  setSubscription,
  setStripeCustomer,
  setEmail,
  findSessionByCustomer,
} from "@/lib/credits";

export const runtime = "nodejs";

function log(event: string, detail: Record<string, unknown>) {
  console.log(`[stripe/webhook] ${event}`, JSON.stringify(detail));
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhooks not configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid signature";
    log("signature_verification_failed", { message });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  log("received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.metadata?.llmscore_session;
        if (!sessionId) {
          log("checkout_missing_session", { checkout: session.id });
          break;
        }
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (customerId) await setStripeCustomer(sessionId, customerId);
        const email = session.customer_details?.email;
        if (email) await setEmail(sessionId, email);

        if (session.mode === "subscription") {
          await setSubscription(sessionId, {
            stripeCustomerId: customerId || "",
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id,
            status: "active",
          });
          const plan = (session.metadata?.plan || "pro") as Plan;
          await setPlan(sessionId, plan);
          log("subscription_activated", { sessionId, customerId, plan });
        } else if (session.metadata?.product === "one_time_report") {
          await unlockReport(sessionId);
          log("report_unlocked", { sessionId, checkout: session.id });
        } else {
          log("checkout_unknown_product", { checkout: session.id });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Only grant renewal credits on recurring cycles, not the first
        // invoice (checkout.session.completed handles the initial grant).
        if (invoice.billing_reason !== "subscription_cycle") break;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;
        const sessionId = await findSessionByCustomer(customerId);
        if (!sessionId) {
          log("invoice_session_not_found", { customerId });
          break;
        }
        log("subscription_renewed", { sessionId, customerId });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        const sessionId =
          sub.metadata?.llmscore_session ||
          (customerId ? await findSessionByCustomer(customerId) : null);
        if (!sessionId) {
          log("subscription_delete_session_not_found", { customerId });
          break;
        }
        await setSubscription(sessionId, {
          stripeCustomerId: customerId || "",
          stripeSubscriptionId: sub.id,
          status: "canceled",
        });
        log("subscription_canceled", { sessionId, customerId });
        break;
      }

      default:
        log("ignored", { type: event.type });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Handler error";
    log("handler_error", { type: event.type, message });
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
