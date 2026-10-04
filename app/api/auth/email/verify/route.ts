import { NextRequest, NextResponse } from "next/server";
import { verifyPin } from "@/lib/pin";
import {
  createSession,
  getOrCreateSessionId,
  attachSessionCookie,
} from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email || "").toLowerCase().trim();
  const pin = (body.pin || "").trim();
  if (!email || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
  }

  const result = verifyPin(email, pin);
  if (result !== "ok") {
    const messages: Record<string, string> = {
      invalid: "Incorrect code. Check and try again.",
      expired: "Code expired. Request a new one.",
      too_many_attempts: "Too many attempts. Request a new code.",
    };
    return NextResponse.json({ error: messages[result] }, { status: 401 });
  }

  // Bind the auth session to the existing anonymous session id so credits
  // and free-audit history carry over.
  const { sessionId } = getOrCreateSessionId(req);
  const boundId = await createSession(email, { sessionId, provider: "email" });

  const res = NextResponse.json({ ok: true, email });
  attachSessionCookie(res, boundId);
  return res;
}
