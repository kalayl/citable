import { NextRequest, NextResponse } from "next/server";
import { runAudit, normalizeUrl } from "@/lib/audit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "Missing 'url' in body" }, { status: 400 });
  }
  const norm = normalizeUrl(body.url);
  if (!norm) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  try {
    const result = await runAudit(body.url);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Audit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
