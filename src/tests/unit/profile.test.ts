import { describe, it, expect } from "vitest";

// Validate changePassword business rules (pure logic, no DB/auth)
function validateChangePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): string | null {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return "All fields are required";
  }
  if (newPassword.length < 8) {
    return "New password must be at least 8 characters";
  }
  if (newPassword !== confirmPassword) {
    return "New passwords do not match";
  }
  return null;
}

describe("changePassword validation", () => {
  it("returns null for valid input", () => {
    expect(validateChangePassword("old123456", "new123456", "new123456")).toBeNull();
  });

  it("requires current password", () => {
    expect(validateChangePassword("", "new123456", "new123456")).toBe(
      "All fields are required",
    );
  });

  it("requires new password", () => {
    expect(validateChangePassword("old123456", "", "")).toBe(
      "All fields are required",
    );
  });

  it("rejects new password shorter than 8 characters", () => {
    expect(validateChangePassword("old123456", "short", "short")).toBe(
      "New password must be at least 8 characters",
    );
  });

  it("rejects mismatched new passwords", () => {
    expect(
      validateChangePassword("old123456", "newpassword1", "newpassword2"),
    ).toBe("New passwords do not match");
  });

  it("accepts new password of exactly 8 characters", () => {
    expect(validateChangePassword("old123456", "exactly8", "exactly8")).toBeNull();
  });
});
