import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

/**
 * NextAuth v5 full configuration (nodejs runtime).
 *
 * NOTE: The Resend (email magic link) provider requires a database adapter
 * to store verification tokens. Since we're serverless without a DB, we use
 * GitHub + Google OAuth + a credentials provider for email signin.
 * When a DB is added later, we can switch to the Resend provider proper.
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

// Credentials provider for email signin (early access - accepts any email)
providers.push(
  Credentials({
    name: "Early Access",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    async authorize(credentials: Record<string, unknown> | undefined) {
      const email = credentials?.email as string;
      if (email && email.includes("@")) {
        return {
          id: email,
          email: email,
          name: email.split("@")[0],
        } as any;
      }
      return null;
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: providers as any,
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