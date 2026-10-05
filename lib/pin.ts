import { createHash, randomInt, timingSafeEqual } from "crypto";
import { eq, sql as dsql } from "drizzle-orm";
import { getDb } from "@/db";
import { pinCodes } from "@/db/schema";

/**
 * Email PIN store backed by Vercel Postgres (survives serverless cold starts).
 * Falls back to in-memory when no DB is configured (local dev).
 *
 * 6-digit codes, 10-minute TTL, max 5 attempts, 30s resend cooldown.
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

// In-memory fallback; survives dev hot-reload via globalThis.
const globalStore = globalThis as unknown as { __llmscorePins?: Map<string, PinEntry> };
const pins: Map<string, PinEntry> = globalStore.__llmscorePins || new Map();
globalStore.__llmscorePins = pins;

function hashPin(email: string, pin: string): string {
  return createHash("sha256").update(`${email.toLowerCase()}:${pin}`).digest("hex");
}

function generatePin(): string {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export type VerifyResult = "ok" | "invalid" | "expired" | "too_many_attempts";

/** Generate and store a PIN for the email. Returns the PIN, or null if rate-limited. */
export async function issuePin(email: string): Promise<string | null> {
  const key = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(pinCodes)
        .where(eq(pinCodes.email, key))
        .limit(1);
      const existing = rows[0];
      if (
        existing &&
        existing.expiresAt.getTime() > Date.now() &&
        Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS
      ) {
        return null; // too soon to resend
      }
      const pin = generatePin();
      const values = {
        email: key,
        codeHash: hashPin(key, pin),
        attempts: 0,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + TTL_MS),
      };
      await db
        .insert(pinCodes)
        .values(values)
        .onConflictDoUpdate({ target: pinCodes.email, set: values });
      return pin;
    } catch (err) {
      console.error("[pin] DB issue failed, using memory:", err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  for (const [k, entry] of pins) if (entry.expiresAt < now) pins.delete(k);
  const existing = pins.get(key);
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) return null;
  const pin = generatePin();
  pins.set(key, {
    hash: hashPin(key, pin),
    expiresAt: now + TTL_MS,
    attempts: 0,
    lastSentAt: now,
  });
  return pin;
}

export async function verifyPin(email: string, pin: string): Promise<VerifyResult> {
  const key = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      const rows = await db
        .select()
        .from(pinCodes)
        .where(eq(pinCodes.email, key))
        .limit(1);
      const entry = rows[0];
      if (!entry) return "expired";
      if (entry.expiresAt.getTime() < Date.now()) {
        await db.delete(pinCodes).where(eq(pinCodes.email, key));
        return "expired";
      }
      if (entry.attempts >= MAX_ATTEMPTS) {
        await db.delete(pinCodes).where(eq(pinCodes.email, key));
        return "too_many_attempts";
      }
      await db
        .update(pinCodes)
        .set({ attempts: dsql`${pinCodes.attempts} + 1` })
        .where(eq(pinCodes.email, key));
      if (safeEqual(hashPin(key, pin), entry.codeHash)) {
        await db.delete(pinCodes).where(eq(pinCodes.email, key));
        return "ok";
      }
      return "invalid";
    } catch (err) {
      console.error("[pin] DB verify failed, using memory:", err);
    }
  }

  // In-memory fallback
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
  if (safeEqual(hashPin(key, pin), entry.hash)) {
    pins.delete(key);
    return "ok";
  }
  return "invalid";
}
