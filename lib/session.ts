import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { SESSION_COOKIE, newSessionId } from "./credits";

/**
 * Session management.
 *
 * Two layers share the same httpOnly `llmscore_session` cookie:
 *  1. Anonymous session id (always present after first API hit) — keys the
 *     credits store in data/credits.json.
 *  2. Authenticated session — when a user signs in (email PIN, Google or
 *     GitHub), the session id is mapped to { email, createdAt } in
 *     data/sessions.json. Auth sessions expire after 7 days.
 */

export interface AuthSession {
  email: string;
  createdAt: string; // ISO timestamp
  provider?: "email" | "google" | "github";
}

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionStore {
  sessions: Record<string, AuthSession>;
}

let writeChain: Promise<void> = Promise.resolve();

async function readSessions(): Promise<SessionStore> {
  try {
    const raw = await fs.readFile(SESSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw) as SessionStore;
    if (!parsed.sessions) parsed.sessions = {};
    return parsed;
  } catch {
    return { sessions: {} };
  }
}

async function writeSessions(store: SessionStore): Promise<void> {
  const task = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = SESSIONS_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
    await fs.rename(tmp, SESSIONS_FILE);
  });
  writeChain = task.catch(() => {});
  return task;
}

function isExpired(s: AuthSession): boolean {
  const created = Date.parse(s.createdAt);
  return !Number.isFinite(created) || Date.now() - created > SESSION_TTL_MS;
}

/* ---------------- anonymous session id (credits) ---------------- */

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

/* ---------------- authenticated sessions ---------------- */

/**
 * Create an authenticated session for `email`, bound to the given (or a new)
 * session id. Returns the session id to set as the cookie value.
 */
export async function createSession(
  email: string,
  opts?: { sessionId?: string; provider?: AuthSession["provider"] },
): Promise<string> {
  const sessionId =
    opts?.sessionId && /^[a-zA-Z0-9-]{10,64}$/.test(opts.sessionId)
      ? opts.sessionId
      : newSessionId();
  const store = await readSessions();
  store.sessions[sessionId] = {
    email: email.toLowerCase().trim(),
    createdAt: new Date().toISOString(),
    provider: opts?.provider,
  };
  await writeSessions(store);
  return sessionId;
}

/** Get the authenticated session for a request, or null. */
export async function getSession(req: NextRequest): Promise<AuthSession | null> {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const store = await readSessions();
  const session = store.sessions[sessionId];
  if (!session) return null;
  if (isExpired(session)) {
    delete store.sessions[sessionId];
    await writeSessions(store);
    return null;
  }
  return session;
}

/** Remove the authenticated session for a request (keeps the cookie/credits id). */
export async function destroySession(req: NextRequest): Promise<void> {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) return;
  const store = await readSessions();
  if (store.sessions[sessionId]) {
    delete store.sessions[sessionId];
    await writeSessions(store);
  }
}

/**
 * Require an authenticated session. Returns the session, or a 401
 * NextResponse ready to return from the route handler.
 */
export async function requireAuth(
  req: NextRequest,
): Promise<{ session: AuthSession; error: null } | { session: null; error: NextResponse }> {
  const session = await getSession(req);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Sign in required", signinUrl: "/signin" },
        { status: 401 },
      ),
    };
  }
  return { session, error: null };
}
