import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "llms-txt",
  "What is llms.txt and why does it matter for AI search?",
  "llms.txt is a plain-text index at your site root that tells AI crawlers what your site is and which pages matter. Learn what a good llms.txt looks like, common mistakes, and how LLMScore audits it."
);

export default function Page() {
  return (
    <CheckShell
      slug="llms-txt"
      annotation="check no. 1 of 9"
      h1="What is llms.txt and why does it matter for AI search?"
    >
      <Tldr>
        llms.txt is a Markdown file at <code>/llms.txt</code> that gives AI
        crawlers a curated map of your site: what it is, who it&apos;s for, and
        which pages answer which questions. Without it, LLMs reconstruct your
        site from whatever HTML they manage to parse. With it, you decide what
        they see first. LLMScore checks that yours exists, that every URL
        resolves, and that it isn&apos;t stale or duplicated.
      </Tldr>

      <Section title="What does llms.txt actually do?">
        <p>
          The llms.txt proposal (from Answer.AI&apos;s Jeremy Howard, 2024)
          defines a simple convention: a Markdown file at your site root with a
          one-line summary of your site, followed by grouped lists of links
          with short descriptions. It&apos;s robots.txt&apos;s helpful sibling —
          instead of saying what crawlers <em>can&apos;t</em> read, it says what
          they <em>should</em> read.
        </p>
        <p>
          AI tools that respect it — and the list grows monthly — use it to
          build a cleaner picture of your site than HTML scraping alone allows.
          That picture feeds answers in ChatGPT search, Perplexity and other
          answer engines where citation slots are scarce.
        </p>
      </Section>

      <Section title="What do good and bad llms.txt files look like?">
        <GoodBad
          bad={
            <CodePanel label="llms.txt — 3 issues" tone="bad">
{`# Example SaaS

## Docs
- [Getting started](/docs/start)
- [API reference](/docs/api-v1)  ← 404
- [Webhooks](/docs/webhooks)
- [Webhooks](/docs/webhooks)     ← duplicate
# updated 2024-03-02             ← stale`}
            </CodePanel>
          }
          good={
            <CodePanel label="llms.txt — passing" tone="good">
{`# Example SaaS
> B2B workflow automation for
> finance teams.

## Docs
- [Getting started](/docs/start):
  Install and first workflow in 10 min
- [API reference](/docs/api):
  REST endpoints, auth, rate limits
- [Webhooks](/docs/webhooks):
  Event types and retry behaviour`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing llms.txt check?">
        <p>
          Three fixes cover most failures. First, <strong>create the file</strong>{" "}
          if it&apos;s missing — a summary line plus your 10–30 most important
          pages, each with a one-line description. Second,{" "}
          <strong>fix dead and duplicate URLs</strong>: every link should return
          200 and appear once. Third, <strong>keep it current</strong> — wire
          generation into your build so new pages appear automatically instead
          of the file quietly rotting.
        </p>
        <p>
          For complete page coverage beyond the curated list, pair it with{" "}
          <a href="/checks/llms-full-txt" className="text-accent-600 underline underline-offset-4">
            llms-full.txt
          </a>
          .
        </p>
      </Section>
    </CheckShell>
  );
}
