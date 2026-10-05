import {
  CheckShell,
  Tldr,
  Section,
  CodePanel,
  GoodBad,
  checkMetadata,
} from "../shared";

export const metadata = checkMetadata(
  "robots",
  "AI crawler robots config: are GPTBot and ClaudeBot allowed?",
  "Your robots.txt decides whether GPTBot, ClaudeBot, PerplexityBot and Google-Extended can read your site. Learn which AI crawlers matter, what accidental blocking costs you, and how to configure intentional access."
);

export default function Page() {
  return (
    <CheckShell
      slug="robots"
      annotation="check no. 4 of 9"
      h1="Are GPTBot and ClaudeBot allowed to read your site?"
    >
      <Tldr>
        If your robots.txt blocks GPTBot, ChatGPT can&apos;t read a single page
        of your site — and can&apos;t cite you. Many sites blocked AI crawlers
        in a 2023 panic (or copied a template that did) and never revisited the
        decision. LLMScore checks your rules for GPTBot, ClaudeBot,
        PerplexityBot, CCBot, Google-Extended and more, and flags accidental
        blocks.
      </Tldr>

      <Section title="Which AI crawlers should I care about?">
        <p>
          The ones that feed answer engines your customers actually use:{" "}
          <strong>GPTBot</strong> and <strong>OAI-SearchBot</strong> (ChatGPT
          and ChatGPT search), <strong>ClaudeBot</strong> (Claude),{" "}
          <strong>PerplexityBot</strong> (Perplexity),{" "}
          <strong>Google-Extended</strong> (Gemini grounding), and{" "}
          <strong>CCBot</strong> (Common Crawl, which feeds many model training
          sets). Blocking them is a legitimate choice for some businesses — but
          it should be a choice, not an accident inherited from a template.
        </p>
      </Section>

      <Section title="What does accidental blocking look like?">
        <GoodBad
          bad={
            <CodePanel label="robots.txt — blocking the answer engines" tone="bad">
{`User-agent: GPTBot
Disallow: /        ← ChatGPT: zero pages

User-agent: CCBot
Disallow: /        ← most training crawls

User-agent: *
Disallow: /admin`}
            </CodePanel>
          }
          good={
            <CodePanel label="robots.txt — intentional access" tone="good">
{`User-agent: GPTBot
Allow: /
Disallow: /app/

User-agent: PerplexityBot
Allow: /

User-agent: *
Disallow: /admin
Sitemap: https://example.com/sitemap.xml`}
            </CodePanel>
          }
        />
      </Section>

      <Section title="How do I fix a failing robots check?">
        <p>
          Audit each AI user-agent explicitly rather than relying on the{" "}
          <code>*</code> wildcard. Allow crawlers on your public marketing,
          docs and blog content; scope out private app routes with targeted{" "}
          <code>Disallow</code> rules. Include your sitemap line. And re-check
          after every infra change — CDNs and WAF products (Cloudflare&apos;s
          AI-bot blocking, for example) can override robots.txt at the network
          layer, so verify crawlers get a 200, not just a permissive rule.
        </p>
      </Section>
    </CheckShell>
  );
}
