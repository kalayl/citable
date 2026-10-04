import { NextRequest } from "next/server";

// Simple middleware that checks session cookie for protected routes.
// NextAuth's middleware wrapper crashes on Vercel edge when OAuth
// credentials are placeholders. This simpler approach works until
// real credentials are set, then we can switch back to NextAuth middleware.

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes - check for session cookie
  if (
    pathname.startsWith("/api/fix") ||
    pathname.startsWith("/api/credits") ||
    pathname.startsWith("/api/stripe/")
  ) {
    const sessionCookie =
      req.cookies.get("authjs.session-id") ||
      req.cookies.get("next-auth.session-token");
    if (!sessionCookie) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return;
}

export const config = {
  // Match all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og.png|robots.txt|sitemap.xml|llms.txt).*)"],
};
