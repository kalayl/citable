import { test, expect } from "@playwright/test";

test.describe("auth", () => {
  test("signin page loads with all 3 provider options", async ({ page }) => {
    const res = await page.goto("/signin");
    expect(res?.status()).toBe(200);

    await expect(
      page.getByRole("heading", { name: /sign in/i })
    ).toBeVisible();

    // GitHub + Google buttons
    await expect(
      page.getByRole("button", { name: /continue with github/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google/i })
    ).toBeVisible();

    // Email (PIN) provider form
    await expect(page.locator("#signin-email")).toBeVisible();
  });

  test("email flow: enter email → PIN step or graceful error", async ({
    page,
  }) => {
    await page.goto("/signin");
    await page.locator("#signin-email").fill("e2e-test@example.com");
    await page
      .locator("form")
      .filter({ has: page.locator("#signin-email") })
      .getByRole("button")
      .click();

    // Either the PIN entry step appears (code issued), or a visible error
    // (e.g. email provider not configured in this environment / rate limited).
    const pinInput = page.locator("#signin-pin");
    const errorMsg = page.locator("p.text-red-600");
    await expect(pinInput.or(errorMsg).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("auth CSRF endpoint responds", async ({ request }) => {
    const res = await request.get("/api/auth/csrf");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.csrfToken).toBe("string");
    expect(body.csrfToken.length).toBeGreaterThan(10);
  });
});
