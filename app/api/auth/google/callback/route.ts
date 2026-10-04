import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  getOrCreateSessionId,
  attachSessionCookie,
} from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("google_oauth_state")?.value;
  const origin = req.nextUrl.origin;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/signin?error=google`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER";
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_PLACEHOLDER";

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${origin}/api/auth/google/callback`,
      }),
    });
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      return NextResponse.redirect(`${origin}/signin?error=google`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = (await userRes.json()) as { email?: string; verified_email?: boolean };
    if (!user.email) {
      return NextResponse.redirect(`${origin}/signin?error=google`);
    }

    const { sessionId } = getOrCreateSessionId(req);
    const boundId = await createSession(user.email, {
      sessionId,
      provider: "google",
    });

    const res = NextResponse.redirect(`${origin}/?signin=success`);
    attachSessionCookie(res, boundId);
    res.cookies.delete("google_oauth_state");
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/signin?error=google`);
  }
}
