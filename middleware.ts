import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Match all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og.png|robots.txt|sitemap.xml|llms.txt).*)"],
};
