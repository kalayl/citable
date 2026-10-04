import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, newSessionId } from "./credits";

/**
 * Anonymous session management (credits layer only).
 *
 * The `llmscore_session` cookie keys the credits store in data/credits.json.
 * Auth (sign-in) is handled by Auth.js (NextAuth v5) — see auth.ts.
 */

export function getOrCreateSessionId(req: NextRequest): {
  sessionId: string;
  isNew: boolean;
} {
  const existing = req.cookies.get(SESSION_COOKIE)?.value;
  if (existing && /^[a-zA-Z0-9-]{10,64}$/.test(existing)) {
    return { sessionId: existing, isNew: false };
  }
  return { sessionId: newSessionId(), isNew: true };
}

export function attachSessionCookie(res: NextResponse, sessionId: string): void {
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
