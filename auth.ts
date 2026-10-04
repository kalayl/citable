import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { authConfig } from "./auth.config";

/**
 * NextAuth v5 full configuration (nodejs runtime).
 *
 * Providers:
 *  - GitHub (repo + user:email scopes) — token stored in JWT for PR creation
 *  - Google (openid + email + profile)
 *  - Resend (email PIN)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
// handlers = { GET, POST } — re-exported for the route handler
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: { scope: "repo user:email" },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_EMAIL_FROM || "LLMScore <noreply@llmscore.dev>",
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, account, profile }) {
      // Persist the GitHub access_token in the JWT for repo operations (PRs).
      if (account?.provider === "github" && account.access_token) {
        token.githubAccessToken = account.access_token;
      }
      // Stash the provider so the client/SSR can read it.
      if (account?.provider) {
        token.provider = account.provider;
      }
      // Ensure email is in the token.
      if (profile?.email) {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose email, provider, and GitHub access token on the session.
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
