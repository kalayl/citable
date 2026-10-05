import { sql } from "@vercel/postgres";
import { drizzle, type VercelPgDatabase } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

/**
 * Drizzle client over Vercel Postgres.
 *
 * `dbAvailable()` reports whether a Postgres connection string is configured.
 * All storage layers (credits, pins, audit cache) gracefully fall back to
 * in-memory stores when the DB isn't configured (local dev without Postgres).
 */

export type Db = VercelPgDatabase<typeof schema>;

export function dbAvailable(): boolean {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

let _db: Db | null = null;

export function getDb(): Db | null {
  if (!dbAvailable()) return null;
  if (!_db) {
    if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
      process.env.POSTGRES_URL = process.env.DATABASE_URL;
    }
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
