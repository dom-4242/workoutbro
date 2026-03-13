import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (class name merger)", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("handles undefined values", () => {
    expect(cn("text-red-500", undefined)).toBe("text-red-500");
  });

  it("handles false conditionals", () => {
    expect(cn("text-red-500", false && "text-blue-500")).toBe("text-red-500");
  });

  it("handles truthy conditionals", () => {
    // font-bold und text-blue-500 sind nicht-konfligierend → beide behalten
    expect(cn("font-bold", true && "text-blue-500")).toBe(
      "font-bold text-blue-500",
    );
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    // twMerge resolves conflicts: last class wins
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("deduplicates conflicting bg classes", () => {
    expect(cn("bg-red-500", "bg-emerald-500")).toBe("bg-emerald-500");
  });

  it("handles empty string", () => {
    expect(cn("")).toBe("");
  });

  it("handles no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe(
      "text-red-500",
    );
  });
});
