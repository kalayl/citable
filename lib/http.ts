const UA =
  "Mozilla/5.0 (compatible; LLMScoreBot/1.0; +https://llmscore.io/bot)";

export async function fetchText(
  url: string,
  timeoutMs = 5000
): Promise<{ status: number; text: string; finalUrl: string } | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xml,text/plain,*/*" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const text = res.ok ? await res.text() : "";
    return { status: res.status, text, finalUrl: res.url || url };
  } catch {
    return null;
  }
}

export async function headCheck(url: string, timeoutMs = 5000): Promise<number> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    let res = await fetch(url, {
      method: "HEAD",
      headers: { "user-agent": UA },
      redirect: "manual",
      signal: ctrl.signal,
    });
    // Some servers reject HEAD; fall back to GET
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        headers: { "user-agent": UA },
        redirect: "manual",
        signal: ctrl.signal,
      });
    }
    clearTimeout(t);
    return res.status;
  } catch {
    return 0;
  }
}

/** Extract attribute value from an HTML tag string. */
export function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3] ?? null) : null;
}

/** All matches of a regex (with /g) returning the full match array list. */
export function matchAll(re: RegExp, text: string): RegExpExecArray[] {
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(text)) !== null) {
    out.push(m);
    if (m.index === r.lastIndex) r.lastIndex++;
  }
  return out;
}

export function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
