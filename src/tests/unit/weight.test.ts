import { describe, it, expect } from "vitest";

// Test the weight validation logic
// We extract it here to test independently from the server action

function validateWeight(weight: number): boolean {
  return !isNaN(weight) && weight >= 20 && weight <= 300;
}

function combineDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

describe("Weight validation", () => {
  it("accepts valid weight", () => {
    expect(validateWeight(75.5)).toBe(true);
  });

  it("rejects weight below 20kg", () => {
    expect(validateWeight(15)).toBe(false);
  });

  it("rejects weight above 300kg", () => {
    expect(validateWeight(350)).toBe(false);
  });

  it("rejects NaN", () => {
    expect(validateWeight(NaN)).toBe(false);
  });
});

describe("Date and time combination", () => {
  it("combines date and time correctly", () => {
    const result = combineDateAndTime("2026-02-15", "08:30");
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.getFullYear()).toBe(2026);
  });
});
