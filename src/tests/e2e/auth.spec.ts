import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/session-helpers";

test.describe("Authentication", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("login with valid credentials", async ({ page }) => {
    // Use loginAs helper which has proper waitForURL (30s) + networkidle waits
    // to handle cold server startup during first Chromium test run
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await expect(page).toHaveURL("/dashboard", { timeout: 5000 });
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill("wrong@email.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /anmelden/i }).click();
    await expect(page.getByText(/ungültige/i)).toBeVisible();
  });
  test.describe("Admin access control", () => {
    test("admin can access admin area", async ({ page }) => {
      // Login as admin — use loginAs helper (30s timeout, handles cold server)
      await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });

      // Navigate to admin
      await page.goto("/admin/users");
      await expect(page).toHaveURL("/admin/users");
    });

    test("trainer cannot access admin area", async ({ page }) => {
      // Login as trainer — use loginAs helper (30s timeout, handles cold server)
      await loginAs(page, process.env.TEST_TRAINER_EMAIL!, process.env.TEST_TRAINER_PASSWORD!);
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });

      // Try to access admin — should redirect to dashboard
      await page.goto("/admin/users");
      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Weight tracking", () => {
    test("athlete can add weight entry", async ({ page }) => {
      // Login — use loginAs helper (30s timeout, handles cold server)
      await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
      await expect(page).toHaveURL("/dashboard", { timeout: 5000 });

      // Fill weight form — use placeholder instead of label
      await page.getByPlaceholder("75.5").fill("80");
      await page.getByRole("button", { name: /eintrag speichern/i }).click();

      // Success message should appear
      await expect(page.getByText(/eintrag gespeichert/i)).toBeVisible();
    });
  });
});
