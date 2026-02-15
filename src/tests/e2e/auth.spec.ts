import { test, expect } from "@playwright/test";

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
    await page.goto("/login");
    await page
      .getByPlaceholder("name@example.com")
      .fill(process.env.TEST_USER_EMAIL!);
    await page
      .getByPlaceholder("••••••••")
      .fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: /anmelden/i }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill("wrong@email.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /anmelden/i }).click();
    await expect(page.getByText(/ungültige/i)).toBeVisible();
  });
});
