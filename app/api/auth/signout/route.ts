import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await destroySession(req);
  const res = NextResponse.json({ ok: true });
  // Also drop the GitHub token on sign-out.
  res.cookies.delete("gh_token");
  return res;
}
