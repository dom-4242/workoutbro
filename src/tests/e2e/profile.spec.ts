import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/session-helpers";

test.describe("Change password", () => {
  test("settings page is accessible from dashboard", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await expect(page).toHaveURL("/dashboard", { timeout: 5000 });

    await page.getByRole("link", { name: /einstellungen/i }).click();
    await expect(page).toHaveURL("/dashboard/settings");
    await expect(page.getByRole("heading", { name: /passwort ändern/i })).toBeVisible();
  });

  test("shows error with wrong current password", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await page.getByPlaceholder("••••••••").nth(0).fill("wrongpassword");
    await page.getByPlaceholder("••••••••").nth(1).fill("newpassword123");
    await page.getByPlaceholder("••••••••").nth(2).fill("newpassword123");
    await page.getByRole("button", { name: /passwort ändern/i }).click();

    await expect(page.getByText(/current password is incorrect/i)).toBeVisible();
  });

  test("shows error when new passwords do not match", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await page.getByPlaceholder("••••••••").nth(0).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByPlaceholder("••••••••").nth(1).fill("newpassword123");
    await page.getByPlaceholder("••••••••").nth(2).fill("differentpassword");
    await page.getByRole("button", { name: /passwort ändern/i }).click();

    await expect(page.getByText(/do not match/i)).toBeVisible();
  });

  test("settings page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL("/login");
  });
});
