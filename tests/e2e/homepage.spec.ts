import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("loads with hero and audit widget", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText(/LLM score/i);

    // Audit widget
    await expect(page.getByLabel("Website URL")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /audit my site/i })
    ).toBeVisible();
  });

  test("audit widget runs: type URL → loading → results", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Website URL").fill("example.com");
    await page.getByRole("button", { name: /audit my site/i }).click();

    // Loading state appears
    await expect(page.getByText(/Crawling example\.com/i)).toBeVisible({
      timeout: 5_000,
    });

    // Results (score /100) appear within the audit window
    await expect(page.getByText("/100").first()).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByText(/AI search readiness — example\.com/i)).toBeVisible();
  });

  test("learn-more links to all 9 check pages are present", async ({ page }) => {
    await page.goto("/");
    const slugs = [
      "llms-txt",
      "llms-full-txt",
      "json-ld",
      "robots",
      "extractability",
      "sitemap",
      "canonicals",
      "og-cards",
      "internal-links",
    ];
    for (const slug of slugs) {
      await expect(
        page.locator(`a[href="/checks/${slug}"]`).first()
      ).toBeAttached();
    }
  });

  test("nav links work", async ({ page }) => {
    await page.goto("/");
    // In-page anchors exist
    await expect(page.locator("#checks")).toBeAttached();
    await expect(page.locator("#how")).toBeAttached();

    // A check page link navigates
    await page.locator('a[href="/checks/llms-txt"]').first().click();
    await expect(page).toHaveURL(/\/checks\/llms-txt/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /llms\.txt/i
    );
  });
});
