import { expect, test } from "@playwright/test";

test.describe("System Health", () => {
  test("should return health status ok", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data).toHaveProperty("timestamp");
  });
});
