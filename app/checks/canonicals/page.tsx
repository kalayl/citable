import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "canonicals",
  "Canonical coverage: preventing duplicate content in AI search",
  "Missing canonical tags split your pages into duplicate URL variants — UTM parameters, trailing slashes, www vs non-www. Learn why that dilutes AI citations and how to fix canonical coverage."
);

export default function Page() {
  return (
    <CheckShell
      slug="canonicals"
      annotation="check no. 7 of 9"
      h1="Canonical coverage: is duplicate content splitting your citations?"
    >
      <Tldr>
        Without a canonical tag, <code>/pricing</code>,{" "}
        <code>/pricing?utm_source=x</code> and <code>/pricing/</code> are three
        different pages to a crawler. Each variant competes with the others,
        and a citation earned by one doesn&apos;t strengthen the rest. LLMScore
        checks that every indexable page declares a canonical and that the
        declared URLs are consistent and self-referencing.
      </Tldr>

      <Section title="Why do canonicals matter for AI search?">
        <p>
          Answer engines deduplicate aggressively — they have to, since
          they&apos;re choosing three to five sources, not ranking ten. The
          canonical tag is your vote for which URL is the real one. Without it,
          the crawler guesses; with inconsistent canonicals (http vs https,
          www vs bare domain), it may distrust the signal entirely. Either way
          your page&apos;s authority gets smeared across variants instead of
          concentrating on one citable URL.
        </p>
      </Section>

      <Section title="What do broken vs. correct canonicals look like?">
        <GoodBad
          bad={
            <CodePanel label="/pricing — canonical issues" tone="bad">
{`<!-- /pricing?utm_source=newsletter -->
<head>
  <!-- no canonical tag -->
</head>

crawler sees:
  /pricing
  /pricing/
  /pricing?utm_source=newsletter
  → 3 competing duplicates`}
            </CodePanel>
          }
          good={
            <CodePanel label="/pricing — passing" tone="good">
{`<!-- every variant of the page -->
<head>
  <link rel="canonical"
    href="https://example.com/pricing" />
</head>

crawler sees:
  one page, one URL,
  all signals consolidated`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing canonicals check?">
        <p>
          Emit a self-referencing canonical on every indexable page from your
          framework&apos;s metadata API — absolute URL, one scheme, one host,
          one trailing-slash convention. Make sure parameterised variants (UTM
          tags, pagination, filters) canonicalise to the clean URL. Then align
          the rest of the stack: your{" "}
          <a href="/checks/sitemap" className="text-accent-600 underline underline-offset-4">
            sitemap
          </a>{" "}
          and{" "}
          <a href="/checks/og-cards" className="text-accent-600 underline underline-offset-4">
            og:url tags
          </a>{" "}
          should use exactly the canonical form, nothing else.
        </p>
      </Section>
    </CheckShell>
  );
}
