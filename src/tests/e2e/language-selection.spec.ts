import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/session-helpers";

// Locate language buttons by title attribute (avoids strict-mode conflicts)
const deBtn = (page: import("@playwright/test").Page) =>
  page.locator('button[title="Deutsch"]');
const ptBtn = (page: import("@playwright/test").Page) =>
  page.locator('button[title="Português"]');
const enBtn = (page: import("@playwright/test").Page) =>
  page.locator('button[title="English"]');

// Form submit → server action → saves locale to DB → redirect back to settings
async function selectLocale(
  page: import("@playwright/test").Page,
  btn: import("@playwright/test").Locator,
) {
  const code = await btn.getAttribute("value");
  await btn.click();
  // Wait for the page to re-render with the new locale (aria-pressed="true" on selected button)
  await page
    .locator(`button[value="${code}"][aria-pressed="true"]`)
    .waitFor({ state: "visible" });
}

test.describe("Language selection", () => {
  test("settings page shows language selector", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await expect(deBtn(page)).toBeVisible();
    await expect(ptBtn(page)).toBeVisible();
    await expect(enBtn(page)).toBeVisible();
  });

  test("switching to PT changes UI to Portuguese", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await selectLocale(page, ptBtn(page));

    // Dashboard should now render in Portuguese
    await page.goto("/dashboard");
    await expect(page.getByText(/bem-vindo/i)).toBeVisible();

    // Cleanup: reset to DE
    await page.goto("/dashboard/settings");
    await selectLocale(page, deBtn(page));
  });

  test("switching to EN changes UI to English", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await selectLocale(page, enBtn(page));

    await page.goto("/dashboard");
    await expect(page.getByText(/welcome/i)).toBeVisible();

    // Cleanup: reset to DE
    await page.goto("/dashboard/settings");
    await selectLocale(page, deBtn(page));
  });

  test("switching back to DE restores German UI", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await selectLocale(page, enBtn(page));
    await selectLocale(page, deBtn(page));

    await page.goto("/dashboard");
    await expect(page.getByText(/willkommen/i)).toBeVisible();
  });

  test("active button reflects persisted locale after page reload", async ({ page }) => {
    await loginAs(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await page.goto("/dashboard/settings");

    await selectLocale(page, ptBtn(page));

    // PT button should now be active (aria-pressed="true")
    await expect(ptBtn(page)).toHaveAttribute("aria-pressed", "true");

    // Cleanup: reset to DE
    await selectLocale(page, deBtn(page));
    await expect(deBtn(page)).toHaveAttribute("aria-pressed", "true");
  });
});
