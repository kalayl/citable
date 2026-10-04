import { NextRequest, NextResponse } from "next/server";
import { getCachedAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  const result = getCachedAudit(decodeURIComponent(domain));
  if (!result) {
    return NextResponse.json(
      { error: "No recent audit for this domain. Run POST /api/audit first." },
      { status: 404 }
    );
  }
  return NextResponse.json(result);
}
