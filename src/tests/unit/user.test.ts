import { describe, it, expect } from "vitest";

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe("Password validation", () => {
  it("accepts password with 8 characters", () => {
    expect(validatePassword("password")).toBe(true);
  });

  it("accepts password with more than 8 characters", () => {
    expect(validatePassword("supersecurepassword")).toBe(true);
  });

  it("rejects password with less than 8 characters", () => {
    expect(validatePassword("short")).toBe(false);
  });

  it("rejects empty password", () => {
    expect(validatePassword("")).toBe(false);
  });
});

describe("Email validation", () => {
  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(validateEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("rejects empty email", () => {
    expect(validateEmail("")).toBe(false);
  });
});
