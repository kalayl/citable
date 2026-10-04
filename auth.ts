import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { authConfig } from "./auth.config";

/**
 * NextAuth v5 full configuration (nodejs runtime).
 *
 * Providers are conditionally included so Auth.js doesn't crash
 * when OAuth credentials aren't configured yet (early access).
 */

// Build providers list - only include providers with real credentials
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

if (process.env.RESEND_API_KEY) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_EMAIL_FROM || "LLMScore <noreply@llmscore.dev>",
    })
  );
}

// Fallback: if no providers are configured, add a dummy credentials provider
// so Auth.js doesn't crash. This allows the signin page to render.
if (providers.length === 0) {
  const Credentials = (await import("next-auth/providers/credentials")).default;
  providers.push(
    Credentials({
      name: "Early Access",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize() {
        return null; // Always returns null - sign-in disabled during early access
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && account.access_token) {
        token.githubAccessToken = account.access_token;
      }
      if (account?.provider) {
        token.provider = account.provider;
      }
      if (profile?.email) {
        token.email = profile.email;
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
