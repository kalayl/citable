import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "sitemap",
  "Sitemap completeness: can AI crawlers find all your pages?",
  "An incomplete sitemap means AI crawlers never discover some of your pages. Learn how missing pages and orphans hurt AI search visibility and how to generate a complete sitemap automatically."
);

export default function Page() {
  return (
    <CheckShell
      slug="sitemap"
      annotation="check no. 6 of 9"
      h1="Sitemap completeness: can AI crawlers actually find all your pages?"
    >
      <Tldr>
        Your sitemap.xml is the discovery backbone for every crawler, AI ones
        included. Two failure modes cost you: indexable pages missing from the
        sitemap (crawlers may never find them) and orphan URLs that exist only
        in the sitemap (a signal of rot). LLMScore diffs your sitemap against
        your crawlable pages and flags both.
      </Tldr>

      <Section title="Why does sitemap completeness matter for AI search?">
        <p>
          AI crawlers run on tighter budgets than Googlebot. They crawl less,
          less often, and lean harder on the maps you give them — sitemap.xml,{" "}
          <a href="/checks/llms-txt" className="text-accent-600 underline underline-offset-4">
            llms.txt
          </a>{" "}
          and{" "}
          <a href="/checks/llms-full-txt" className="text-accent-600 underline underline-offset-4">
            llms-full.txt
          </a>
          . A page missing from all of them exists only if a crawler stumbles
          across a link to it. For a citation-hungry docs page or comparison
          post, that&apos;s a coin flip you don&apos;t need to take.
        </p>
      </Section>

      <Section title="What do the two failure modes look like?">
        <GoodBad
          bad={
            <CodePanel label="sitemap audit — 2 failure modes" tone="bad">
{`live indexable pages:   340
in sitemap.xml:         312

missing from sitemap:    28  ← invisible
in sitemap but 404/410:   7  ← orphans
lastmod dates:         none  ← no freshness
                              signal`}
            </CodePanel>
          }
          good={
            <CodePanel label="sitemap.xml — passing" tone="good">
{`<urlset>
  <url>
    <loc>https://example.com/docs/auth</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <!-- all 340 indexable pages,
       0 orphans, lastmod on each -->
</urlset>`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing sitemap check?">
        <p>
          Generate the sitemap from your router or CMS at build time — never
          maintain it by hand. Include every indexable page, exclude anything
          noindexed or redirected, and set honest <code>lastmod</code> dates
          (crawlers use them to prioritise re-crawls). Reference the sitemap in
          robots.txt. Then keep it consistent with your{" "}
          <a href="/checks/canonicals" className="text-accent-600 underline underline-offset-4">
            canonicals
          </a>
          : every sitemap URL should be the canonical form, not a variant.
        </p>
      </Section>
    </CheckShell>
  );
}
