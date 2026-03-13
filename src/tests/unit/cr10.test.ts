import { describe, it, expect } from "vitest";
import { getCR10Color, getCR10TrackStyle, getCR10Style, CR10_LABELS } from "@/lib/cr10";

// ─── getCR10Color ─────────────────────────────────────────────────────────────

describe("getCR10Color", () => {
  it("returns blue for 0", () => {
    expect(getCR10Color(0)).toBe("#60a5fa");
  });

  it("returns blue for 2 (boundary)", () => {
    expect(getCR10Color(2)).toBe("#60a5fa");
  });

  it("returns emerald for 3", () => {
    expect(getCR10Color(3)).toBe("#34d399");
  });

  it("returns emerald for 4 (boundary)", () => {
    expect(getCR10Color(4)).toBe("#34d399");
  });

  it("returns amber for 5", () => {
    expect(getCR10Color(5)).toBe("#fbbf24");
  });

  it("returns amber for 6 (boundary)", () => {
    expect(getCR10Color(6)).toBe("#fbbf24");
  });

  it("returns orange for 7", () => {
    expect(getCR10Color(7)).toBe("#f97316");
  });

  it("returns orange for 8 (boundary)", () => {
    expect(getCR10Color(8)).toBe("#f97316");
  });

  it("returns red for 9", () => {
    expect(getCR10Color(9)).toBe("#ef4444");
  });

  it("returns red for 10 (maximum)", () => {
    expect(getCR10Color(10)).toBe("#ef4444");
  });
});

// ─── getCR10TrackStyle ────────────────────────────────────────────────────────

describe("getCR10TrackStyle", () => {
  it("returns a linear-gradient string", () => {
    const style = getCR10TrackStyle(5);
    expect(style).toContain("linear-gradient(to right");
  });

  it("uses the correct color for the value", () => {
    const style = getCR10TrackStyle(5); // amber
    expect(style).toContain("#fbbf24");
  });

  it("includes gray background for unfilled portion", () => {
    const style = getCR10TrackStyle(5);
    expect(style).toContain("#374151");
  });

  it("calculates correct percentage for 0 (0%)", () => {
    const style = getCR10TrackStyle(0);
    expect(style).toContain("0%");
  });

  it("calculates correct percentage for 5 (50%)", () => {
    const style = getCR10TrackStyle(5);
    expect(style).toContain("50%");
  });

  it("calculates correct percentage for 10 (100%)", () => {
    const style = getCR10TrackStyle(10);
    expect(style).toContain("100%");
  });
});

// ─── getCR10Style (Tailwind badge classes) ────────────────────────────────────

describe("getCR10Style", () => {
  it("returns blue classes for RPE 0", () => {
    expect(getCR10Style(0)).toContain("blue");
  });

  it("returns blue classes for RPE 2 (boundary)", () => {
    expect(getCR10Style(2)).toContain("blue");
  });

  it("returns emerald classes for RPE 3", () => {
    expect(getCR10Style(3)).toContain("emerald");
  });

  it("returns emerald classes for RPE 4 (boundary)", () => {
    expect(getCR10Style(4)).toContain("emerald");
  });

  it("returns amber classes for RPE 5", () => {
    expect(getCR10Style(5)).toContain("amber");
  });

  it("returns amber classes for RPE 6 (boundary)", () => {
    expect(getCR10Style(6)).toContain("amber");
  });

  it("returns orange classes for RPE 7", () => {
    expect(getCR10Style(7)).toContain("orange");
  });

  it("returns orange classes for RPE 8 (boundary)", () => {
    expect(getCR10Style(8)).toContain("orange");
  });

  it("returns red classes for RPE 9", () => {
    expect(getCR10Style(9)).toContain("red");
  });

  it("returns red classes for RPE 10 (maximum)", () => {
    expect(getCR10Style(10)).toContain("red");
  });

  it("returns a string with bg-, text-, and border- classes", () => {
    const style = getCR10Style(5);
    expect(style).toMatch(/bg-/);
    expect(style).toMatch(/text-/);
    expect(style).toMatch(/border-/);
  });
});

// ─── CR10_LABELS ──────────────────────────────────────────────────────────────

describe("CR10_LABELS", () => {
  it("has entries for all values 0–10", () => {
    for (let i = 0; i <= 10; i++) {
      expect(CR10_LABELS[i]).toBeDefined();
      expect(typeof CR10_LABELS[i]).toBe("string");
    }
  });

  it("label for 0 is 'Gar nichts'", () => {
    expect(CR10_LABELS[0]).toBe("Gar nichts");
  });

  it("label for 10 is 'Absolutes Maximum'", () => {
    expect(CR10_LABELS[10]).toBe("Absolutes Maximum");
  });

  it("label for 9 is 'Extrem schwer'", () => {
    expect(CR10_LABELS[9]).toBe("Extrem schwer");
  });

  it("has no empty labels", () => {
    for (let i = 0; i <= 10; i++) {
      expect(CR10_LABELS[i].length).toBeGreaterThan(0);
    }
  });
});
