import { test, expect } from "@playwright/test";

const PAGES = [
  { slug: "llms-txt", h1: /llms\.txt/i },
  { slug: "llms-full-txt", h1: /llms-full\.txt/i },
  { slug: "json-ld", h1: /JSON-LD/i },
  { slug: "robots", h1: /GPTBot|robots/i },
  { slug: "extractability", h1: /extractab/i },
  { slug: "sitemap", h1: /sitemap/i },
  { slug: "canonicals", h1: /canonical/i },
  { slug: "og-cards", h1: /OG|cards/i },
  { slug: "internal-links", h1: /internal linking/i },
];

test.describe("content pages", () => {
  for (const { slug, h1 } of PAGES) {
    test(`/checks/${slug} loads with H1 and TL;DR`, async ({ page }) => {
      const res = await page.goto(`/checks/${slug}`);
      expect(res?.status()).toBe(200);

      // Exactly one H1, matching expected topic
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toContainText(h1);

      // TL;DR block present
      await expect(page.getByText("TL;DR", { exact: true })).toBeVisible();

      // Canonical tag points at the right URL
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        `https://llmscore.io/checks/${slug}`
      );

      // CTA back to the audit widget
      await expect(
        page.getByRole("link", { name: /run this check on your site/i })
      ).toBeVisible();
    });
  }

  test("sitemap.xml includes all 9 check pages", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const { slug } of PAGES) {
      expect(xml).toContain(`https://llmscore.io/checks/${slug}`);
    }
  });

  test("llms.txt and llms-full.txt include the check pages", async ({
    request,
  }) => {
    const llms = await (await request.get("/llms.txt")).text();
    const llmsFull = await (await request.get("/llms-full.txt")).text();
    for (const { slug } of PAGES) {
      expect(llms).toContain(`/checks/${slug}`);
      expect(llmsFull).toContain(`/checks/${slug}`);
    }
  });
});
