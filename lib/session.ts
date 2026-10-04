import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, newSessionId } from "./credits";

/**
 * Get the session id from the request cookie, or create a new one.
 * Returns the id plus a flag indicating whether the cookie must be set
 * on the response.
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
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
