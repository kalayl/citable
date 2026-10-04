import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ signedIn: false });
  return NextResponse.json({
    signedIn: true,
    email: session.email,
    provider: session.provider || null,
  });
}
