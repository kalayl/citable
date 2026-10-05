import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "internal-links",
  "Internal linking: can crawlers reach your pages in 2 clicks?",
  "Internal links are how crawlers discover pages and how AI models understand what matters on your site. Learn why orphan pages lose citations and how to build a crawlable link structure."
);

export default function Page() {
  return (
    <CheckShell
      slug="internal-links"
      annotation="check no. 9 of 9"
      h1="Internal linking: can crawlers reach your key pages within two clicks?"
    >
      <Tldr>
        Internal links are votes: they tell crawlers which pages exist and
        which pages matter. A page three-plus clicks from your homepage — or
        linked from nowhere at all — gets crawled late, weighted lightly, and
        cited rarely. LLMScore maps your internal link graph and flags orphan
        pages and key pages buried too deep.
      </Tldr>

      <Section title="Why does internal linking matter for AI search?">
        <p>
          AI crawlers discover your site the old-fashioned way: follow links,
          budget permitting. Their budgets are smaller than Googlebot&apos;s,
          so depth hurts more. A page reachable only through a paginated
          archive might get crawled by Google eventually — an AI crawler may
          never get there. Links also carry meaning: anchor text and link
          frequency teach models which pages are your authoritative answer on a
          topic.
        </p>
        <p>
          The classic failure is the content-rich site where every blog post is
          an island: linked from one archive page, linking out to nothing.
        </p>
      </Section>

      <Section title="What do orphaned vs. connected pages look like?">
        <GoodBad
          bad={
            <CodePanel label="link graph — before" tone="bad">
{`/docs/sso-setup
  inbound links:  0   ← orphan
  depth:          ∞   (sitemap only)

/compare/vs-competitor
  inbound links:  1   (page 7 of blog
  depth:          5    archive)`}
            </CodePanel>
          }
          good={
            <CodePanel label="link graph — after" tone="good">
{`/docs/sso-setup
  inbound links:  14  (docs sidebar,
  depth:          2    pricing, 3 posts)

/compare/vs-competitor
  inbound links:  9   (homepage, nav,
  depth:          1    related posts)`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing internal links check?">
        <p>
          Start from your money pages — the ones you want cited — and work
          backwards: each should be reachable within two clicks of the
          homepage and linked from several relevant pages with descriptive
          anchor text (&quot;SSO setup guide&quot;, not &quot;click
          here&quot;). Add related-content blocks to posts and docs, link
          hub pages to their children and back, and make sure links are real{" "}
          <code>&lt;a href&gt;</code> elements in server-rendered HTML — not
          JavaScript click handlers crawlers can&apos;t follow. Then verify no
          page lives only in the{" "}
          <a href="/checks/sitemap" className="text-accent-600 underline underline-offset-4">
            sitemap
          </a>
          .
        </p>
      </Section>
    </CheckShell>
  );
}
