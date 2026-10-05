import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

export const runtime = "nodejs";

/**
 * POST /api/auth/pin/verify — { email, pin } → verify against the DB-backed
 * PIN store and create a session via the "pin" Credentials provider.
 *
 * Verification happens inside the provider's authorize() (lib/pin.verifyPin),
 * so the PIN is checked exactly once and consumed on success.
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
    return NextResponse.json(
      { error: "Email and 6-digit PIN required" },
      { status: 400 }
    );
  }

  try {
    await signIn("pin", { email, pin, redirect: false });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired code. Request a new one if needed." },
      { status: 401 }
    );
  }
}
