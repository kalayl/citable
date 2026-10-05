import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-IP rate limiting for the audit API, backed by Upstash Redis.
 * Gracefully disabled when Upstash env vars are not configured (early access).
 */

function isConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(
    url &&
      token &&
      !url.includes("PLACEHOLDER") &&
      !token.includes("PLACEHOLDER"),
  );
}

let freeLimiter: Ratelimit | null = null;
let subscribedLimiter: Ratelimit | null = null;

function getLimiters() {
  if (!isConfigured()) return null;
  if (!freeLimiter || !subscribedLimiter) {
    const redis = Redis.fromEnv();
    freeLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(5, "1 m", 5),
      prefix: "llmscore:rl:free",
    });
    subscribedLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(50, "1 m", 50),
      prefix: "llmscore:rl:sub",
    });
  }
  return { freeLimiter, subscribedLimiter };
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}

/**
 * Check rate limit for an IP. Returns { success: true } when Upstash is not
 * configured (early access mode) or on any limiter error.
 */
export async function checkRateLimit(
  ip: string,
  subscribed: boolean,
): Promise<RateLimitResult> {
  const limiters = getLimiters();
  if (!limiters) return { success: true };
  try {
    const limiter = subscribed
      ? limiters.subscribedLimiter!
      : limiters.freeLimiter!;
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    return { success, limit, remaining, reset };
  } catch (e) {
    console.warn("[ratelimit]", e instanceof Error ? e.message : e);
    return { success: true };
  }
}

/** Extract client IP from a request (works on Vercel / proxies). */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
