import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "json-ld",
  "JSON-LD for AI extraction: will an LLM get a clean answer?",
  "JSON-LD structured data is how AI systems extract clean answers from your pages. Learn which schema types matter for AI search, why schema-content mismatch kills citations, and how to fix it."
);

export default function Page() {
  return (
    <CheckShell
      slug="json-ld"
      annotation="check no. 3 of 9"
      h1="JSON-LD for AI extraction: will an LLM get a clean answer from your page?"
    >
      <Tldr>
        JSON-LD gives machines an unambiguous version of your page: this is a
        FAQ, this is the question, this is the answer. The bar for AI search
        isn&apos;t &quot;is schema present?&quot; — it&apos;s &quot;can an LLM
        extract a complete, correct answer from it?&quot; LLMScore validates
        your FAQPage, Organization, Product, HowTo and Breadcrumb schema, and
        checks that it actually matches what&apos;s on the page.
      </Tldr>

      <Section title="Why does JSON-LD matter more in AI search than classic SEO?">
        <p>
          In classic SEO, structured data earned you rich snippets — nice to
          have. In AI search, structured data is extraction fuel. When an answer
          engine assembles a response, pages that state facts in clean,
          machine-readable form are cheaper and safer to cite than pages the
          model has to interpret from layout and prose.
        </p>
        <p>
          The failure mode we see most isn&apos;t missing schema — it&apos;s{" "}
          <em>hollow</em> schema: a FAQPage with one question when the page has
          six, an acceptedAnswer left empty, an Organization block with no logo
          or description. Hollow schema passes a validator and still gives the
          LLM nothing.
        </p>
      </Section>

      <Section title="What does hollow vs. complete schema look like?">
        <GoodBad
          bad={
            <CodePanel label="FAQPage — hollow" tone="bad">
{`{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How much does it cost?"
    // acceptedAnswer missing
  }]
}
// page shows 6 FAQs, schema has 1`}
            </CodePanel>
          }
          good={
            <CodePanel label="FAQPage — complete" tone="good">
{`{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How much does it cost?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Plans start at $29/mo.
        The audit itself is free."
    }
  }, /* …all 6 FAQs… */ ]
}`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing JSON-LD check?">
        <p>
          Start with the types that map to answers: <strong>FAQPage</strong> on
          any page with Q&amp;A content, <strong>HowTo</strong> on tutorials,{" "}
          <strong>Product</strong> with real price and availability,{" "}
          <strong>Organization</strong> once site-wide, and{" "}
          <strong>BreadcrumbList</strong> so models understand your hierarchy.
          Then enforce alignment: generate schema from the same data that
          renders the page, so the two can&apos;t drift. Hand-maintained schema
          always drifts.
        </p>
      </Section>
    </CheckShell>
  );
}
