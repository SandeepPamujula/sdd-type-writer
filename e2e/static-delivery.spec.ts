import { test, expect } from "@playwright/test";
import { execSync, spawn, type ChildProcess } from "node:child_process";

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) return;
    } catch {
      // Not accepting connections yet; retry.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

test.describe("Requirement: Static delivery", () => {
  test("scenario: Served from a static host", async ({ page }) => {
    // Asserts against the current placeholder; becomes the literal spec
    // scenario ("the name entry screen appears and works") once
    // add-user-identity lands.
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);
    await expect(page.getByText("Typing Tutor")).toBeVisible();
  });

  test.describe("scenario: Served under a sub-path", () => {
    test.describe.configure({ timeout: 60_000 });

    const port = 3100;
    const basePath = "/sdd-type-writer";
    const serverRoot = "out-subpath-root";
    // serve maps disk paths directly to URL paths, so the export must land
    // in a nested folder matching basePath for the sub-path URL to resolve.
    const exportDir = `${serverRoot}${basePath}`;
    let server: ChildProcess;

    test.beforeAll(async () => {
      execSync("npm run build", {
        env: {
          ...process.env,
          NEXT_PUBLIC_BASE_PATH: basePath,
          NEXT_EXPORT_DIR: exportDir,
        },
        stdio: "inherit",
      });
      server = spawn(`npx serve ${serverRoot} -l ${port}`, {
        stdio: "ignore",
        shell: true,
      });
      await waitForServer(`http://localhost:${port}${basePath}/`, 30_000);
    });

    test.afterAll(() => {
      server.kill();
    });

    test("loads and works under the sub-path", async ({ page }) => {
      const failedResponses: string[] = [];
      page.on("response", (response) => {
        if (response.status() >= 400) {
          failedResponses.push(`${response.status()} ${response.url()}`);
        }
      });

      const response = await page.goto(`http://localhost:${port}${basePath}/`);
      expect(response?.ok()).toBe(true);
      await expect(page.getByText("Typing Tutor")).toBeVisible();
      await page.waitForLoadState("networkidle");

      expect(failedResponses).toEqual([]);
    });
  });
});
