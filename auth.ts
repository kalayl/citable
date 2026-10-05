import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { authConfig } from "./auth.config";
import { getDb, dbAvailable } from "./db";
import {
  users,
  accounts,
  authSessions,
  verificationTokens,
} from "./db/schema";
import { verifyPin } from "./lib/pin";

/**
 * NextAuth v5 full configuration (nodejs runtime).
 *
 * With Vercel Postgres configured, the Drizzle adapter enables the Resend
 * email magic-link provider. A "pin" Credentials provider backs the
 * email + 6-digit PIN flow (see app/api/auth/pin). Sessions stay JWT so
 * the edge middleware config (auth.config.ts) keeps working.
 */

const providers = [];

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: { scope: "repo user:email" },
      },
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid email profile" },
      },
    })
  );
}

// Resend magic-link provider needs a database adapter for verification tokens.
const resendKey = process.env.AUTH_RESEND_KEY || process.env.RESEND_API_KEY;
if (dbAvailable() && resendKey) {
  providers.push(
    Resend({
      apiKey: resendKey,
      from: process.env.EMAIL_FROM || "LLMScore <noreply@llmscore.dev>",
    })
  );
}

// Email + PIN provider. The PIN is issued via POST /api/auth/pin (stored
// hashed in Postgres) and verified here to create the session.
providers.push(
  Credentials({
    id: "pin",
    name: "Email PIN",
    credentials: {
      email: { label: "Email", type: "email" },
      pin: { label: "PIN", type: "text" },
    },
    async authorize(credentials: Record<string, unknown> | undefined) {
      const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
      const pin = (credentials?.pin as string | undefined)?.trim();
      if (!email || !email.includes("@") || !pin || !/^\d{6}$/.test(pin)) {
        return null;
      }
      const result = await verifyPin(email, pin);
      if (result !== "ok") return null;
      return {
        id: email,
        email,
        name: email.split("@")[0],
      } as any;
    },
  })
);

const db = getDb();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  ...(db
    ? {
        adapter: DrizzleAdapter(db, {
          usersTable: users,
          accountsTable: accounts,
          sessionsTable: authSessions,
          verificationTokensTable: verificationTokens,
        }),
      }
    : {}),
  session: { strategy: "jwt" },
  providers: providers as any,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "github" && account.access_token) {
        token.githubAccessToken = account.access_token;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      if (profile?.email) {
        token.email = profile.email;
      }
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user = { ...session.user, email: token.email as string };
      }
      if (token.provider) {
        (session as unknown as Record<string, unknown>).provider = token.provider;
      }
      if (token.githubAccessToken) {
        (session as unknown as Record<string, unknown>).githubAccessToken =
          token.githubAccessToken;
      }
      return session;
    },
  },
});
