import fs from "node:fs";
import path from "node:path";

describe("CSS token system (web-platform: Light and dark themes)", () => {
  const css = fs.readFileSync(path.join(__dirname, "tokens.css"), "utf-8");

  function injectStylesheet() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => style.remove();
  }

  it("defines light-mode background, foreground and feedback tokens", () => {
    const cleanup = injectStylesheet();
    const root = window.getComputedStyle(document.documentElement);

    expect(root.getPropertyValue("--color-background").trim()).toBe("#ffffff");
    expect(root.getPropertyValue("--color-foreground").trim()).toBe("#1a1a1a");
    expect(root.getPropertyValue("--color-char-pending").trim()).toBe("#5f5f5f");
    expect(root.getPropertyValue("--color-char-correct").trim()).toBe("#0f7a3d");
    expect(root.getPropertyValue("--color-char-incorrect").trim()).toBe("#b3261e");

    cleanup();
  });

  it("marks the incorrect token with a non-color property, not color alone", () => {
    expect(css).toMatch(/--color-char-incorrect-background:/);
    expect(css).toMatch(/--color-char-incorrect-decoration:\s*underline/);
  });

  it("redefines the palette under prefers-color-scheme: dark", () => {
    const darkBlockMatch = css.match(
      /@media \(prefers-color-scheme: dark\)\s*{([\s\S]*)}\s*}\s*$/,
    );
    expect(darkBlockMatch).not.toBeNull();

    const darkBlock = darkBlockMatch![1];
    expect(darkBlock).toMatch(/--color-background:\s*#121212/);
    expect(darkBlock).toMatch(/--color-foreground:\s*#f2f2f2/);
    expect(darkBlock).toMatch(/--color-char-correct:\s*#4fd07a/);
    expect(darkBlock).toMatch(/--color-char-incorrect:\s*#ff8a80/);
  });
});
