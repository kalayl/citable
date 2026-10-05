import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "extractability",
  "Content extractability: will AI cite your pages?",
  "AI answer engines cite pages they can extract clean answers from: question-based headings, TL;DR blocks, self-contained paragraphs. Learn how extractable content wins citations and how to restructure yours."
);

export default function Page() {
  return (
    <CheckShell
      slug="extractability"
      annotation="check no. 5 of 9"
      h1="Content extractability: will an AI engine actually cite your pages?"
    >
      <Tldr>
        Answer engines don&apos;t rank pages — they lift answers. Pages win
        citations when a model can extract a complete, quotable answer:
        question-phrased H2s, a TL;DR up top, paragraphs that stand alone
        without three screens of context. LLMScore scans your top pages for
        question-based headings, summary blocks and answer-shaped structure.
      </Tldr>

      <Section title="What makes content extractable?">
        <p>
          When an LLM assembles an answer, it works from chunks of your page —
          not the whole thing. Extractable content means each chunk carries its
          own weight: an H2 that matches the question a user asked, followed
          immediately by a direct answer, followed by supporting detail. The
          classic marketing page — clever headline, vibes, scattered claims —
          gives the model nothing it can safely quote.
        </p>
        <p>
          This is the check where content teams have the most leverage: no code
          changes, just structure.
        </p>
      </Section>

      <Section title="What do unextractable vs. extractable pages look like?">
        <GoodBad
          bad={
            <CodePanel label="blog post — unextractable" tone="bad">
{`<h2>A new chapter begins</h2>
<p>We've been on quite a journey.
When we started, nobody believed…
(answer to "what does it cost?"
buried in paragraph 14)</p>`}
            </CodePanel>
          }
          good={
            <CodePanel label="blog post — extractable" tone="good">
{`<h2>How much does Example cost?</h2>
<p>Example costs $29/user/month on
the Team plan. A free tier covers up
to 3 users. Annual billing saves 20%.</p>

<h2>How does it compare to X?</h2>
<p>…</p>`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing extractability check?">
        <p>
          Rewrite H2s on your key pages as the literal questions customers ask
          — the ones from sales calls and support tickets. Put a two-to-three
          sentence TL;DR at the top of long pages. Lead each section with the
          answer, then elaborate. Pair the structure with matching{" "}
          <a href="/checks/json-ld" className="text-accent-600 underline underline-offset-4">
            FAQPage schema
          </a>{" "}
          so the same answers exist in machine-readable form, and keep critical
          answers in server-rendered HTML — content that only appears after
          JavaScript runs is invisible to most AI crawlers.
        </p>
      </Section>
    </CheckShell>
  );
}
