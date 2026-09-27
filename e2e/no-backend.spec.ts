import { test, expect } from "@playwright/test";

test.describe("Requirement: No backend", () => {
  test("scenario: No data leaves the browser", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    const requestsAfterLoad: string[] = [];
    page.on("request", (request) => {
      requestsAfterLoad.push(request.url());
    });

    // Give any stray post-load activity (lazy chunks, timers) a chance to fire.
    await page.waitForTimeout(1000);

    expect(requestsAfterLoad).toHaveLength(0);
  });

  test("scenario: Offline after load", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await context.setOffline(true);

    await expect(page.getByText("Typing Tutor")).toBeVisible();
  });
});
