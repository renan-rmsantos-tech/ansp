import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const globalsCSS = fs.readFileSync(
  path.resolve(__dirname, "../app/globals.css"),
  "utf-8"
);

const brandColors = {
  bg: "oklch(97.5% 0.005 85)",
  surface: "oklch(100% 0 0)",
  fg: "oklch(22% 0.06 250)",
  muted: "oklch(48% 0.03 250)",
  border: "oklch(90% 0.008 85)",
  accent: "oklch(25% 0.06 250)",
  gold: "oklch(72% 0.10 80)",
  cream: "oklch(92% 0.03 85)",
  success: "oklch(52% 0.14 155)",
  warn: "oklch(68% 0.14 70)",
  danger: "oklch(52% 0.16 25)",
};

describe("Brand tokens in globals.css @theme", () => {
  for (const [token, value] of Object.entries(brandColors)) {
    it(`defines --color-${token} with correct OKLch value`, () => {
      expect(globalsCSS).toContain(`--color-${token}: ${value}`);
    });
  }
});

describe("Font stacks in globals.css @theme", () => {
  it("defines display font with serif stack", () => {
    expect(globalsCSS).toContain("--font-display:");
    expect(globalsCSS).toContain("Iowan Old Style");
    expect(globalsCSS).toContain("Charter");
    expect(globalsCSS).toContain("Palatino");
    expect(globalsCSS).toContain("Georgia");
  });

  it("defines body font with system sans stack", () => {
    expect(globalsCSS).toContain("--font-body:");
    expect(globalsCSS).toContain("system-ui");
    expect(globalsCSS).toContain("sans-serif");
  });

  it("does not load external fonts", () => {
    expect(globalsCSS).not.toContain("@import url(");
    expect(globalsCSS).not.toContain("fonts.googleapis.com");
  });
});

describe("Border radius tokens", () => {
  it("defines radius-md as 0.5rem (8px)", () => {
    expect(globalsCSS).toContain("--radius-md: 0.5rem");
  });
});
