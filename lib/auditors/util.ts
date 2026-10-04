import { CategoryResult, Issue } from "../types";

export function finalize(
  name: string,
  key: string,
  score: number,
  issues: Issue[]
): CategoryResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const ranked = [...issues].sort(
    (a, b) => rank(a.severity) - rank(b.severity)
  );
  const topFixes = ranked
    .filter((i) => i.severity !== "pass" && i.fix)
    .slice(0, 3)
    .map((i) => i.fix);
  return { name, key, score: clamped, issues: ranked, topFixes };
}

function rank(s: Issue["severity"]): number {
  return s === "critical" ? 0 : s === "warning" ? 1 : 2;
}

export function failCategory(name: string, key: string, message: string, fix: string): CategoryResult {
  return finalize(name, key, 0, [{ severity: "critical", message, fix }]);
}
