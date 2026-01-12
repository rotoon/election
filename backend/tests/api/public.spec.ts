import { expect, test } from "@playwright/test";

test.describe("Public API", () => {
  test("should verify parties endpoint structure", async ({ request }) => {
    const response = await request.get("/api/public/parties");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    // Check structure based on standard response
    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body).toHaveProperty("meta");
  });

  test("should verify constituencies endpoint structure", async ({
    request,
  }) => {
    const response = await request.get("/api/public/constituencies");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body).toHaveProperty("success", true);
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  // Depending on whether results data exists, this might fail or return empty.
  // We just check it returns valid JSON.
  test("should verify results endpoint", async ({ request }) => {
    const response = await request.get("/api/public/results");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body).toHaveProperty("success", true);
    // Data might be array or object depending on implementation,
    // but based on code: getAllResults returns array probably?
    // public.routes.ts line 26: res.json({ success: true, data: results });
    expect(body).toHaveProperty("data");
  });
});
