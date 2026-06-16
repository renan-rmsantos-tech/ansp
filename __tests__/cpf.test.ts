import { describe, it, expect } from "vitest";
import { isValidCPF, formatCPF } from "@/lib/validations/cpf";

describe("isValidCPF", () => {
  it("validates real CPF numbers", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("111.444.777-35")).toBe(true);
    expect(isValidCPF("11144477735")).toBe(true);
  });

  it("rejects known-invalid sequences (all same digit)", () => {
    for (let d = 0; d <= 9; d++) {
      expect(isValidCPF(String(d).repeat(11))).toBe(false);
    }
  });

  it("rejects CPFs with wrong check digits", () => {
    expect(isValidCPF("529.982.247-26")).toBe(false);
    expect(isValidCPF("52998224700")).toBe(false);
  });

  it("rejects CPFs with wrong length", () => {
    expect(isValidCPF("123456789")).toBe(false);
    expect(isValidCPF("123456789012")).toBe(false);
    expect(isValidCPF("")).toBe(false);
  });
});

describe("formatCPF", () => {
  it("formats raw digits into CPF format", () => {
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });
});
