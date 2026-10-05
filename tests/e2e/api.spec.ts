import { test, expect } from "@playwright/test";

test.describe("API endpoints", () => {
  test("POST /api/audit with valid URL returns audit result", async ({
    request,
  }) => {
    const res = await request.post("/api/audit", {
      data: { url: "example.com" },
      timeout: 90_000,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.domain).toContain("example.com");
    expect(typeof body.overallScore).toBe("number");
    expect(Array.isArray(body.categories)).toBeTruthy();
    expect(Array.isArray(body.topFixes)).toBeTruthy();
  });

  test("POST /api/audit with missing url returns 400", async ({ request }) => {
    const res = await request.post("/api/audit", { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/audit with invalid JSON returns 400", async ({ request }) => {
    const res = await request.post("/api/audit", {
      headers: { "Content-Type": "application/json" },
      data: "not json{{",
    });
    expect(res.status()).toBe(400);
  });

  test("GET /api/auth/csrf returns a token", async ({ request }) => {
    const res = await request.get("/api/auth/csrf");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.csrfToken).toBe("string");
  });

  test("GET /api/auth/providers lists providers", async ({ request }) => {
    const res = await request.get("/api/auth/providers");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body).toBe("object");
    expect(Object.keys(body).length).toBeGreaterThan(0);
  });

  test("GET /api/credits responds without auth", async ({ request }) => {
    const res = await request.get("/api/credits");
    // Anonymous sessions are allowed a response; unauthenticated may be 200
    // (anon session record) or 401 depending on configuration.
    expect([200, 401]).toContain(res.status());
  });

  test("POST /api/fix without auth is rejected", async ({ request }) => {
    const res = await request.post("/api/fix", { data: {} });
    expect([400, 401, 403]).toContain(res.status());
  });
});
