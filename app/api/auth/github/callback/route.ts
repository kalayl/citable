import { NextRequest, NextResponse } from "next/server";
import { GITHUB_TOKEN_COOKIE } from "@/lib/github";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("gh_oauth_state")?.value;
  const origin = req.nextUrl.origin;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/?github=error`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID || "GITHUB_CLIENT_ID_PLACEHOLDER";
  const clientSecret =
    process.env.GITHUB_CLIENT_SECRET || "GITHUB_CLIENT_SECRET_PLACEHOLDER";

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/api/auth/github/callback`,
      }),
    });
    const data = (await tokenRes.json()) as { access_token?: string };
    if (!data.access_token) {
      return NextResponse.redirect(`${origin}/?github=error`);
    }

    const res = NextResponse.redirect(`${origin}/?github=connected`);
    res.cookies.set(GITHUB_TOKEN_COOKIE, data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.cookies.delete("gh_oauth_state");
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/?github=error`);
  }
}
