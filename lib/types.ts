export type Severity = "critical" | "warning" | "pass";

export interface Issue {
  severity: Severity;
  message: string;
  fix: string;
}

export interface CategoryResult {
  name: string;
  key: string;
  score: number; // 0-100
  issues: Issue[];
  topFixes: string[];
}

export interface AuditResult {
  domain: string;
  url: string;
  overallScore: number;
  categories: CategoryResult[];
  topFixes: { category: string; severity: Severity; message: string; fix: string }[];
  crawledAt: string;
  pagesCrawled: number;
}

/** Shared crawl context passed to every auditor so pages are fetched once. */
export interface CrawlContext {
  baseUrl: string; // normalized origin, e.g. https://example.com
  domain: string;
  homepage: PageData | null;
  samplePages: PageData[]; // up to 9 additional pages
  sitemapUrls: string[];
}

export interface PageData {
  url: string;
  status: number;
  html: string;
}
