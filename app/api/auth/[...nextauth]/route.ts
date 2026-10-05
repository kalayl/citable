import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { trackSignIn } from "@/lib/analytics";

export const { GET } = handlers;

export async function POST(req: NextRequest) {
  const res = await handlers.POST(req);

  // Track sign-in attempts on provider callbacks (best-effort, never throws).
  const match = req.nextUrl.pathname.match(/\/api\/auth\/callback\/([^/]+)/);
  if (match && res.status < 400) {
    await trackSignIn(match[1]);
  }

  return res;
}
