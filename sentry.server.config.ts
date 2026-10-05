import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn && !dsn.includes("PLACEHOLDER")) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
