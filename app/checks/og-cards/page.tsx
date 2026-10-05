import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "og-cards",
  "OG and Twitter cards: how AI sees and presents your pages",
  "Open Graph and Twitter card tags are the packaging AI search results use when they cite you. Learn why missing og:image and inconsistent titles hurt click-through from AI answers, and how to fix them."
);

export default function Page() {
  return (
    <CheckShell
      slug="og-cards"
      annotation="check no. 8 of 9"
      h1="OG and Twitter cards: how do AI engines see — and show — your pages?"
    >
      <Tldr>
        When an AI answer cites your page, the citation card is built from your
        Open Graph tags: og:title, og:description, og:image. Miss them and you
        get a bare grey link next to competitors with rich previews. LLMScore
        checks that every page ships complete, consistent OG and Twitter tags
        — not just the homepage.
      </Tldr>

      <Section title="Why do social cards matter beyond social?">
        <p>
          OG tags were built for Facebook shares, but they&apos;ve become the
          universal &quot;preview contract&quot; of the web. Perplexity&apos;s
          source cards, ChatGPT search citations, Slack and iMessage unfurls —
          all read the same tags. They&apos;re also a clean extraction signal:
          og:title and og:description are a machine-readable summary of the
          page, which is exactly what answer engines want.
        </p>
        <p>
          The common failure isn&apos;t a missing homepage card — it&apos;s
          coverage. Blog posts and docs pages, the pages most likely to be
          cited, are the ones most often shipped without og:image or with a
          site-generic description on every page.
        </p>
      </Section>

      <Section title="What do incomplete vs. complete cards look like?">
        <GoodBad
          bad={
            <CodePanel label="blog post — incomplete" tone="bad">
{`<meta property="og:title"
  content="Blog" />      ← generic
<!-- og:description missing -->
<!-- og:image missing →
     grey box in citation cards -->
<!-- twitter:card missing -->`}
            </CodePanel>
          }
          good={
            <CodePanel label="blog post — passing" tone="good">
{`<meta property="og:title"
  content="Migrating from X: a guide" />
<meta property="og:description"
  content="Step-by-step migration in
  under an hour, with rollback plan." />
<meta property="og:image"
  content="https://example.com/og/
  migrate-x.png" />
<meta name="twitter:card"
  content="summary_large_image" />`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing OG cards check?">
        <p>
          Generate per-page tags from your framework&apos;s metadata API: a
          unique title and description per page, a 1200×630 og:image (generated
          programmatically if you have many pages), and{" "}
          <code>twitter:card</code> set to <code>summary_large_image</code>.
          Keep <code>og:url</code> identical to your{" "}
          <a href="/checks/canonicals" className="text-accent-600 underline underline-offset-4">
            canonical URL
          </a>
          , and make descriptions genuinely descriptive — they double as
          extraction-ready summaries for AI engines.
        </p>
      </Section>
    </CheckShell>
  );
}
