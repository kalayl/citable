import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Lightweight credits store backed by a JSON file at data/credits.json.
 * No DB dependency — fine for early access volumes.
 */

export const SESSION_COOKIE = "llmscore_session";

export interface Transaction {
  at: string; // ISO timestamp
  type: "purchase" | "audit" | "subscription_grant" | "free_audit";
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

interface Store {
  sessions: Record<string, SessionRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "credits.json");

// Serialize writes within this process to avoid clobbering.
let writeChain: Promise<void> = Promise.resolve();

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.sessions) parsed.sessions = {};
    return parsed;
  } catch {
    return { sessions: {} };
  }
}

async function writeStore(store: Store): Promise<void> {
  const task = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
    await fs.rename(tmp, DATA_FILE);
  });
  writeChain = task.catch(() => {});
  return task;
}

function emptyRecord(): SessionRecord {
  return { credits: 0, freeAuditsUsed: [], subscription: null, transactions: [] };
}

export function newSessionId(): string {
  return randomUUID();
}

export async function getRecord(sessionId: string): Promise<SessionRecord> {
  const store = await readStore();
  return store.sessions[sessionId] || emptyRecord();
}

async function mutate(
  sessionId: string,
  fn: (rec: SessionRecord) => void,
): Promise<SessionRecord> {
  const store = await readStore();
  const rec = store.sessions[sessionId] || emptyRecord();
  fn(rec);
  store.sessions[sessionId] = rec;
  await writeStore(store);
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
  note?: string,
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
  sub: SubscriptionInfo | null,
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
  const store = await readStore();
  for (const [sid, rec] of Object.entries(store.sessions)) {
    if (
      rec.stripeCustomerId === customerId ||
      rec.subscription?.stripeCustomerId === customerId
    ) {
      return sid;
    }
  }
  return null;
}
