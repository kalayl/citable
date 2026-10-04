import type { NextAuthConfig } from "next-auth";

/**
 * Minimal config used by middleware (edge runtime).
 * The full config with providers lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers: [
    // Providers are added in auth.ts (nodejs runtime).
    // This empty array satisfies the type for the edge config.
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      // Public routes
      if (
        pathname === "/" ||
        pathname === "/signin" ||
        pathname.startsWith("/api/audit") ||
        pathname.startsWith("/api/auth/")
      ) {
        return true;
      }

      // Protected routes
      if (
        pathname.startsWith("/api/fix") ||
        pathname.startsWith("/api/credits") ||
        pathname.startsWith("/api/stripe/")
      ) {
        return isLoggedIn;
      }

      return true;
    },
  },
};
