import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe(".env.example", () => {
  const envContent = fs.readFileSync(
    path.resolve(__dirname, "../.env.example"),
    "utf-8"
  );

  it("contains NEXT_PUBLIC_SUPABASE_URL", () => {
    expect(envContent).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("contains NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    expect(envContent).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});
