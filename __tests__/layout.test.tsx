import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const layoutSource = fs.readFileSync(
  path.resolve(__dirname, "../app/layout.tsx"),
  "utf-8"
);

describe("Root layout", () => {
  it("sets lang to pt-BR", () => {
    expect(layoutSource).toContain('lang="pt-BR"');
  });

  it("imports globals.css", () => {
    expect(layoutSource).toContain("./globals.css");
  });

  it("does not import Google fonts", () => {
    expect(layoutSource).not.toContain("next/font/google");
    expect(layoutSource).not.toContain("googleapis");
  });
});
