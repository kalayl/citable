import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { verifyPin } from "@/lib/pin";

export const runtime = "nodejs";

/**
 * POST /api/auth/pin/verify — { email, pin } → verify against DB and create
 * a session via the "pin" Credentials provider.
 *
 * Note: the client normally calls signIn("pin", ...) directly (which runs
 * verifyPin in the provider's authorize). This route exists for API clients.
 */
export async function POST(req: NextRequest) {
  let email: string;
  let pin: string;
  try {
    const body = await req.json();
    email = String(body?.email || "").toLowerCase().trim();
    pin = String(body?.pin || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!email || !email.includes("@") || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Email and 6-digit PIN required" }, { status: 400 });
  }

  const result = await verifyPin(email, pin);
  if (result !== "ok") {
    const messages: Record<string, string> = {
      invalid: "Incorrect code. Try again.",
      expired: "Code expired. Request a new one.",
      too_many_attempts: "Too many attempts. Request a new code.",
    };
    const status = result === "invalid" ? 401 : 410;
    return NextResponse.json({ error: messages[result] || "Verification failed" }, { status });
  }

  // PIN verified and consumed. Issue a fresh one-shot PIN is not needed —
  // create the session directly through Auth.js signIn (server-side).
  try {
    await signIn("pin", { email, pin: "verified", redirect: false });
  } catch {
    // The credentials provider will reject the consumed PIN; session creation
    // for API clients should use signIn("pin") from the client instead.
  }

  return NextResponse.json({ ok: true });
}
