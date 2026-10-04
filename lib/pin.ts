import { createHash, randomInt, timingSafeEqual } from "crypto";

/**
 * In-memory email PIN store. 6-digit codes, 10-minute TTL, max 5 attempts.
 * Clears on restart — acceptable for early access.
 */

interface PinEntry {
  hash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

// Survive dev hot-reload via globalThis.
const globalStore = globalThis as unknown as { __llmscorePins?: Map<string, PinEntry> };
const pins: Map<string, PinEntry> = globalStore.__llmscorePins || new Map();
globalStore.__llmscorePins = pins;

function hashPin(email: string, pin: string): string {
  return createHash("sha256").update(`${email.toLowerCase()}:${pin}`).digest("hex");
}

function prune(): void {
  const now = Date.now();
  for (const [key, entry] of pins) {
    if (entry.expiresAt < now) pins.delete(key);
  }
}

/** Generate and store a PIN for the email. Returns the PIN, or null if rate-limited. */
export function issuePin(email: string): string | null {
  prune();
  const key = email.toLowerCase().trim();
  const existing = pins.get(key);
  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    return null; // too soon to resend
  }
  const pin = String(randomInt(0, 1000000)).padStart(6, "0");
  pins.set(key, {
    hash: hashPin(key, pin),
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  });
  return pin;
}

export type VerifyResult = "ok" | "invalid" | "expired" | "too_many_attempts";

export function verifyPin(email: string, pin: string): VerifyResult {
  prune();
  const key = email.toLowerCase().trim();
  const entry = pins.get(key);
  if (!entry) return "expired";
  if (entry.expiresAt < Date.now()) {
    pins.delete(key);
    return "expired";
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    pins.delete(key);
    return "too_many_attempts";
  }
  entry.attempts += 1;
  const candidate = Buffer.from(hashPin(key, pin));
  const expected = Buffer.from(entry.hash);
  if (candidate.length === expected.length && timingSafeEqual(candidate, expected)) {
    pins.delete(key);
    return "ok";
  }
  return "invalid";
}
