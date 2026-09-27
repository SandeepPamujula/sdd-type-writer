import { test, expect } from "@playwright/test";

test.describe("Requirement: Light and dark themes", () => {
  test("scenario: Dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    const background = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
    );
    const foreground = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim(),
    );
    expect(background).toBe("#121212");
    expect(foreground).toBe("#f2f2f2");

    // The rendered body should actually pick up the dark token, not just define it.
    const bodyBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bodyBackground).toBe("rgb(18, 18, 18)");
  });

  test("light colour scheme uses the light token values", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    const background = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim(),
    );
    // Chromium serializes computed custom-property hex values to their
    // shortest form, so #ffffff round-trips as #fff (unlike #121212 above,
    // which has no shorthand).
    expect(background).toBe("#fff");

    const bodyBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(bodyBackground).toBe("rgb(255, 255, 255)");
  });
});
