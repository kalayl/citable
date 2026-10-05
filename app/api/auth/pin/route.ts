import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { issuePin } from "@/lib/pin";

export const runtime = "nodejs";

/**
 * POST /api/auth/pin — { email } → generate a 6-digit PIN, store its hash
 * (Postgres-backed, survives cold starts) and send it via Resend.
 */
export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = String(body?.email || "").toLowerCase().trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const pin = await issuePin(email);
  if (!pin) {
    return NextResponse.json(
      { error: "Please wait before requesting another code." },
      { status: 429 }
    );
  }

  const apiKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "LLMScore <noreply@llmscore.dev>",
        to: email,
        subject: `Your LLMScore sign-in code: ${pin}`,
        text: `Your LLMScore sign-in code is ${pin}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
      });
    } catch (err) {
      console.error("[pin] Failed to send email:", err);
      return NextResponse.json(
        { error: "Failed to send email. Try again." },
        { status: 500 }
      );
    }
  } else {
    // Dev without Resend configured: log the PIN server-side.
    console.log(`[pin] (dev) PIN for ${email}: ${pin}`);
  }

  return NextResponse.json({ ok: true });
}
