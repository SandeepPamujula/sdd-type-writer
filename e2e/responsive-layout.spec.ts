import { test, expect } from "@playwright/test";

test.describe("Requirement: Responsive layout", () => {
  for (const width of [360, 375]) {
    test(`scenario: Phone width (${width}px) has no horizontal scrollbar`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");

      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
