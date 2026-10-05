import { randomUUID } from "crypto";
import { eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { credits as creditsTable } from "@/db/schema";
import { PLAN_LIMITS, type Plan } from "@/lib/stripe";

/**
 * Credits store backed by Vercel Postgres (Drizzle).
 * Falls back to an in-memory store when no DB is configured (local dev).
 */

export const SESSION_COOKIE = "llmscore_session";

export interface Transaction {
  at: string; // ISO timestamp
  type:
    | "purchase"
    | "audit"
    | "subscription_grant"
    | "free_audit"
    | "plan_set"
    | "pr_fix"
    | "report_unlock";
  credits: number; // positive = added, negative = deducted
  note?: string;
}

export interface SubscriptionInfo {
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: "active" | "canceled";
}

export interface SessionRecord {
  credits: number;
  email?: string;
  freeAuditsUsed: string[]; // domains
  subscription: SubscriptionInfo | null;
  stripeCustomerId?: string;
  transactions: Transaction[];
}

// ---------------------------------------------------------------------------
// In-memory fallback (dev without Postgres). Survives hot-reload.
// ---------------------------------------------------------------------------

const globalStore = globalThis as unknown as {
  __llmscoreCredits?: Map<string, SessionRecord>;
};
const memStore: Map<string, SessionRecord> =
  globalStore.__llmscoreCredits || new Map();
globalStore.__llmscoreCredits = memStore;

function emptyRecord(): SessionRecord {
  return { credits: 0, freeAuditsUsed: [], subscription: null, transactions: [] };
}

export function newSessionId(): string {
  return randomUUID();
}

// ---------------------------------------------------------------------------
// Row <-> record mapping
// ---------------------------------------------------------------------------

type CreditsRow = typeof creditsTable.$inferSelect;

function rowToRecord(row: CreditsRow): SessionRecord {
  const subscription: SubscriptionInfo | null =
    row.subscriptionStatus && row.stripeCustomerId
      ? {
          stripeCustomerId: row.stripeCustomerId,
          stripeSubscriptionId: row.stripeSubscriptionId || undefined,
          status: row.subscriptionStatus as SubscriptionInfo["status"],
        }
      : null;
  return {
    credits: row.credits,
    email: row.email || undefined,
    freeAuditsUsed: row.freeAuditsUsed || [],
    subscription,
    stripeCustomerId: row.stripeCustomerId || undefined,
    transactions: (row.transactions as Transaction[]) || [],
  };
}

async function dbGet(sessionId: string): Promise<SessionRecord | null> {
  const db = getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(creditsTable)
    .where(eq(creditsTable.sessionId, sessionId))
    .limit(1);
  return rows[0] ? rowToRecord(rows[0]) : null;
}

async function dbUpsert(sessionId: string, rec: SessionRecord): Promise<void> {
  const db = getDb();
  if (!db) return;
  const values = {
    sessionId,
    email: rec.email ?? null,
    credits: rec.credits,
    freeAuditsUsed: rec.freeAuditsUsed,
    subscriptionStatus: rec.subscription?.status ?? null,
    stripeCustomerId:
      rec.stripeCustomerId ?? rec.subscription?.stripeCustomerId ?? null,
    stripeSubscriptionId: rec.subscription?.stripeSubscriptionId ?? null,
    transactions: rec.transactions,
    updatedAt: new Date(),
  };
  await db
    .insert(creditsTable)
    .values(values)
    .onConflictDoUpdate({ target: creditsTable.sessionId, set: values });
}

// ---------------------------------------------------------------------------
// Public API (unchanged)
// ---------------------------------------------------------------------------

export async function getRecord(sessionId: string): Promise<SessionRecord> {
  try {
    const fromDb = await dbGet(sessionId);
    if (fromDb) return fromDb;
    if (getDb()) return emptyRecord();
  } catch (err) {
    console.error("[credits] DB read failed, using memory:", err);
  }
  return memStore.get(sessionId) || emptyRecord();
}

async function mutate(
  sessionId: string,
  fn: (rec: SessionRecord) => void
): Promise<SessionRecord> {
  const rec = await getRecord(sessionId);
  fn(rec);
  try {
    if (getDb()) {
      await dbUpsert(sessionId, rec);
      return rec;
    }
  } catch (err) {
    console.error("[credits] DB write failed, using memory:", err);
  }
  memStore.set(sessionId, rec);
  return rec;
}

export async function getCredits(sessionId: string): Promise<number> {
  return (await getRecord(sessionId)).credits;
}

export async function hasActiveSubscription(sessionId: string): Promise<boolean> {
  const rec = await getRecord(sessionId);
  return rec.subscription?.status === "active";
}

export async function deductCredit(sessionId: string, note?: string): Promise<boolean> {
  let ok = false;
  await mutate(sessionId, (rec) => {
    if (rec.credits > 0) {
      rec.credits -= 1;
      rec.transactions.push({
        at: new Date().toISOString(),
        type: "audit",
        credits: -1,
        note,
      });
      ok = true;
    }
  });
  return ok;
}

export async function addCredits(
  sessionId: string,
  amount: number,
  type: Transaction["type"] = "purchase",
  note?: string
): Promise<SessionRecord> {
  return mutate(sessionId, (rec) => {
    rec.credits += amount;
    rec.transactions.push({ at: new Date().toISOString(), type, credits: amount, note });
  });
}

export async function hasFreeAudit(sessionId: string, domain: string): Promise<boolean> {
  const rec = await getRecord(sessionId);
  return rec.freeAuditsUsed.includes(domain.toLowerCase());
}

// ---------------------------------------------------------------------------
// Plan / tier gating
// ---------------------------------------------------------------------------

const PLAN_NAMES: Plan[] = ["free", "pro", "agency", "enterprise", "founding_pro"];

/**
 * Resolve the plan for a session.
 * Plan is recorded via a `plan_set` transaction (written by the Stripe
 * webhook). An active subscription without an explicit plan defaults to
 * "pro" (legacy records). No subscription = free.
 */
export async function getPlan(sessionId: string): Promise<Plan> {
  const rec = await getRecord(sessionId);
  if (rec.subscription?.status !== "active") return "free";
  for (let i = rec.transactions.length - 1; i >= 0; i--) {
    const t = rec.transactions[i];
    if (t.type === "plan_set" && t.note && PLAN_NAMES.includes(t.note as Plan)) {
      return t.note as Plan;
    }
  }
  return "pro";
}

/** Record the plan for a session (called from the Stripe webhook). */
export async function setPlan(sessionId: string, plan: Plan): Promise<void> {
  await mutate(sessionId, (rec) => {
    rec.transactions.push({
      at: new Date().toISOString(),
      type: "plan_set",
      credits: 0,
      note: plan,
    });
  });
}

/** Record a one-time $9 full-report unlock (optionally scoped to a domain). */
export async function unlockReport(sessionId: string, domain?: string): Promise<void> {
  await mutate(sessionId, (rec) => {
    rec.transactions.push({
      at: new Date().toISOString(),
      type: "report_unlock",
      credits: 0,
      note: domain?.toLowerCase(),
    });
  });
}

/**
 * Full report access: any paid plan, or a one-time report unlock.
 * If `domain` is given, a domain-scoped unlock must match (unscoped unlocks
 * count for any domain).
 */
export async function canAccessFullReport(
  sessionId: string,
  domain?: string
): Promise<boolean> {
  const plan = await getPlan(sessionId);
  if (PLAN_LIMITS[plan].fullReport) return true;
  const rec = await getRecord(sessionId);
  const d = domain?.toLowerCase();
  return rec.transactions.some(
    (t) => t.type === "report_unlock" && (!t.note || !d || t.note === d)
  );
}

/** PR fixes created in the current calendar month (UTC). */
export async function getPrFixCountThisMonth(sessionId: string): Promise<number> {
  const rec = await getRecord(sessionId);
  const now = new Date();
  const prefix = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return rec.transactions.filter(
    (t) => t.type === "pr_fix" && t.at.startsWith(prefix)
  ).length;
}

/**
 * Can this session create `count` more PR fixes this month?
 * Returns the decision plus context for upgrade prompts.
 */
export async function canCreatePR(
  sessionId: string,
  count = 1
): Promise<{ allowed: boolean; plan: Plan; used: number; limit: number }> {
  const plan = await getPlan(sessionId);
  const limit = PLAN_LIMITS[plan].prFixesPerMonth;
  const used = await getPrFixCountThisMonth(sessionId);
  return { allowed: used + count <= limit, plan, used, limit };
}

/** Record a successful PR fix against this month's quota. */
export async function recordPrFix(sessionId: string, note?: string): Promise<void> {
  await mutate(sessionId, (rec) => {
    rec.transactions.push({
      at: new Date().toISOString(),
      type: "pr_fix",
      credits: 0,
      note,
    });
  });
}

/** Max tracked sites for this session's plan. */
export async function getTrackedSitesLimit(sessionId: string): Promise<number> {
  const plan = await getPlan(sessionId);
  return PLAN_LIMITS[plan].trackedSites;
}

export async function markFreeAudit(sessionId: string, domain: string): Promise<void> {
  await mutate(sessionId, (rec) => {
    const d = domain.toLowerCase();
    if (!rec.freeAuditsUsed.includes(d)) {
      rec.freeAuditsUsed.push(d);
      rec.transactions.push({
        at: new Date().toISOString(),
        type: "free_audit",
        credits: 0,
        note: d,
      });
    }
  });
}

export async function setSubscription(
  sessionId: string,
  sub: SubscriptionInfo | null
): Promise<void> {
  await mutate(sessionId, (rec) => {
    rec.subscription = sub;
    if (sub?.stripeCustomerId) rec.stripeCustomerId = sub.stripeCustomerId;
  });
}

export async function setEmail(sessionId: string, email: string): Promise<void> {
  await mutate(sessionId, (rec) => {
    rec.email = email;
  });
}

export async function setStripeCustomer(sessionId: string, customerId: string): Promise<void> {
  await mutate(sessionId, (rec) => {
    rec.stripeCustomerId = customerId;
  });
}

/** Find a session by Stripe customer id (for webhook events without metadata). */
export async function findSessionByCustomer(customerId: string): Promise<string | null> {
  try {
    const db = getDb();
    if (db) {
      const rows = await db
        .select({ sessionId: creditsTable.sessionId })
        .from(creditsTable)
        .where(or(eq(creditsTable.stripeCustomerId, customerId)))
        .limit(1);
      return rows[0]?.sessionId ?? null;
    }
  } catch (err) {
    console.error("[credits] DB lookup failed, using memory:", err);
  }
  for (const [sid, rec] of memStore) {
    if (
      rec.stripeCustomerId === customerId ||
      rec.subscription?.stripeCustomerId === customerId
    ) {
      return sid;
    }
  }
  return null;
}
