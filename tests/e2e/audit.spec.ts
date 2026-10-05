import { test, expect } from "@playwright/test";

test.describe("audit flow", () => {
  test("audit on example.com shows score and category breakdowns", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Website URL").fill("example.com");
    await page.getByRole("button", { name: /audit my site/i }).click();

    // Score appears
    await expect(page.getByText("/100").first()).toBeVisible({
      timeout: 90_000,
    });

    // Category breakdowns render (the widget lists categories with n/100)
    const categoryScores = page.getByText(/\/100/);
    expect(await categoryScores.count()).toBeGreaterThan(3);

    // Link to full report exists
    await expect(
      page.getByRole("link", { name: /view full report/i })
    ).toBeVisible();
  });

  test("report page loads for an audited domain", async ({ page, request }) => {
    // Ensure an audit exists for example.com first
    const res = await request.post("/api/audit", {
      data: { url: "example.com" },
      timeout: 90_000,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(typeof body.overallScore).toBe("number");
    expect(body.overallScore).toBeGreaterThanOrEqual(0);
    expect(body.overallScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(body.categories)).toBeTruthy();
    expect(body.categories.length).toBeGreaterThan(3);

    const pageRes = await page.goto("/report/example.com");
    expect(pageRes?.status()).toBe(200);
    await expect(page.getByText(/example\.com/).first()).toBeVisible({
      timeout: 90_000,
    });
  });
});
