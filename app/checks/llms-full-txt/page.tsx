import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "llms-full-txt",
  "llms-full.txt: the complete page index for AI crawlers",
  "llms-full.txt lists every indexable page on your site for AI crawlers, not just the highlights. Learn why coverage matters, how it differs from llms.txt, and how to generate it from your sitemap."
);

export default function Page() {
  return (
    <CheckShell
      slug="llms-full-txt"
      annotation="check no. 2 of 9"
      h1="What is llms-full.txt, and why do AI crawlers need a complete page index?"
    >
      <Tldr>
        Where <a href="/checks/llms-txt" className="text-accent-600 underline underline-offset-4">llms.txt</a>{" "}
        is a curated highlight reel, llms-full.txt is the complete index —
        every indexable page, with a short description. AI crawlers that use it
        can reach pages they&apos;d otherwise never discover. LLMScore compares
        it against your live sitemap and flags every indexable page that&apos;s
        missing.
      </Tldr>

      <Section title="How is llms-full.txt different from llms.txt?">
        <p>
          llms.txt answers &quot;what is this site and where should I start?&quot;
          llms-full.txt answers &quot;what is <em>everything</em> here?&quot; A
          typical SaaS site has 20 pages in llms.txt and 300+ pages that could
          each win a citation — a docs page, a comparison post, a changelog
          entry. If those pages aren&apos;t in llms-full.txt, AI crawlers that
          rely on it simply never see them.
        </p>
        <p>
          In audits we run, this is the single most common gap: sites ship a
          tidy llms.txt and leave the majority of their indexable pages
          unreachable through the LLM layer.
        </p>
      </Section>

      <Section title="What does a passing llms-full.txt look like?">
        <GoodBad
          bad={
            <CodePanel label="site with no llms-full.txt" tone="bad">
{`GET /llms-full.txt → 404

sitemap.xml:     340 pages
llms.txt:         18 pages
reachable via
LLM layer:        18 / 340 (5%)`}
            </CodePanel>
          }
          good={
            <CodePanel label="llms-full.txt — passing" tone="good">
{`# Example SaaS — Full Page Index
> All pages. See /llms.txt for overview.

## Docs (142 pages)
- [Getting started](/docs/start): …
- [Auth](/docs/auth): API keys, OAuth
…

## Blog (121 pages)
- [Migrating from X](/blog/migrate-x): …
…`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I generate and maintain it?">
        <p>
          Don&apos;t write it by hand. Generate it from the same source of truth
          as your{" "}
          <a href="/checks/sitemap" className="text-accent-600 underline underline-offset-4">
            sitemap
          </a>{" "}
          at build time: walk your routes or CMS entries, group by section, and
          emit one line per page with a genuinely descriptive sentence — the
          description is what an LLM uses to decide whether the page answers a
          question. A stale llms-full.txt is nearly as bad as a missing one, so
          regenerate on every deploy.
        </p>
      </Section>
    </CheckShell>
  );
}
