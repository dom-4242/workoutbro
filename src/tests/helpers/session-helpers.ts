import { type Page } from "@playwright/test";

export const ATHLETE_EMAIL = "dom@dom42.ch";
export const ATHLETE_PASSWORD = "password123";
export const TRAINER_EMAIL = "afonso@dom42.ch";
export const TRAINER_PASSWORD = "trainer123";

export const PUSHER_DELAY = 3000; // ms to wait for Pusher event + page reload

export async function loginAs(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await page.getByPlaceholder("name@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /anmelden/i }).click();
  await page.waitForURL("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

export async function loginAsAthlete(page: Page): Promise<void> {
  await loginAs(page, ATHLETE_EMAIL, ATHLETE_PASSWORD);
}

export async function loginAsTrainer(page: Page): Promise<void> {
  await loginAs(page, TRAINER_EMAIL, TRAINER_PASSWORD);
}

/**
 * Athlete starts a session and returns the session URL.
 */
export async function createWaitingSession(page: Page): Promise<string> {
  await loginAsAthlete(page);
  await page.getByRole("button", { name: /session starten/i }).click();
  await page.waitForURL(/\/dashboard\/session\/.+$/);
  return page.url();
}

/**
 * Trainer joins the first waiting session and returns the trainer session URL.
 */
export async function joinSessionAsTrainer(page: Page): Promise<string> {
  await loginAsTrainer(page);
  await page.getByRole("button", { name: "Beitreten" }).first().click();
  await page.waitForURL(/\/dashboard\/session\/.+\/trainer$/);
  return page.url();
}

/**
 * Creates a draft round with the given exercise names.
 * Page must be on the trainer session page.
 */
export async function createDraftRound(
  page: Page,
  exerciseNames: string[],
): Promise<void> {
  await page.getByRole("button", { name: /\+ Runde|Neue Runde/i }).click();

  for (const name of exerciseNames) {
    await page.getByRole("combobox").last().selectOption({ label: name });
    await page.getByRole("button", { name: /Übung hinzufügen/i }).click();
  }

  await page.getByRole("button", { name: /Änderungen speichern/i }).click();
  // Wait for Pusher round-saved event + reload
  await page.waitForTimeout(PUSHER_DELAY);
}

/**
 * Releases the first DRAFT round.
 * Page must be on the trainer session page.
 */
export async function releaseDraftRound(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: /Runde freigeben/i })
    .first()
    .click();
  // Wait for Pusher ROUND_RELEASED event + reload
  await page.waitForTimeout(PUSHER_DELAY);
}
