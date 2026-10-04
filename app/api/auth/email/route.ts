import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { issuePin } from "@/lib/pin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = (body.email || "").toLowerCase().trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email sign-in is not configured yet" },
      { status: 503 },
    );
  }

  const pin = issuePin(email);
  if (!pin) {
    return NextResponse.json(
      { error: "Code already sent. Wait 30 seconds before requesting another." },
      { status: 429 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const from = process.env.AUTH_EMAIL_FROM || "LLMScore <noreply@llmscore.dev>";
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: `${pin} is your LLMScore sign-in code`,
      text: `Your LLMScore sign-in code is ${pin}\n\nIt expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      html: `<div style="font-family:Georgia,serif;max-width:420px;margin:0 auto;padding:32px 24px;color:#2a2a35;background:#faf7f2;border:1px solid #e6ddd0;border-radius:8px;">
  <p style="margin:0 0 8px;font-size:15px;">Your LLMScore sign-in code:</p>
  <p style="margin:0 0 16px;font-size:34px;letter-spacing:8px;font-weight:600;">${pin}</p>
  <p style="margin:0;font-size:13px;color:#8a8275;">It expires in 10 minutes. If you didn't request this, ignore this email.</p>
</div>`,
    });
    if (error) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: `Code sent to ${email}` });
}
