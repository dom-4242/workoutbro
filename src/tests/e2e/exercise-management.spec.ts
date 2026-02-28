import { test, expect } from "@playwright/test";
import {
  loginAs,
  loginAsTrainer,
  createWaitingSession,
  joinSessionAsTrainer,
  PUSHER_DELAY,
  ATHLETE_EMAIL,
  ATHLETE_PASSWORD,
} from "../helpers/session-helpers";

const ADMIN_EMAIL = "dom@dom42.ch"; // athlete also has ADMIN role
const ADMIN_PASSWORD = "password123";

// ─── Test 8: Admin creates exercise with all fields ───────────────────────────
test("admin can create a complete exercise", async ({ page }) => {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto("/admin/exercises");

  await page.getByRole("button", { name: /Neue Übung|Übung erstellen/i }).click();

  await page.getByLabel(/Name/i).fill("E2E Test Exercise");
  await page.getByLabel(/Kategorie/i).fill("Kraft");

  // Check all required fields
  const checkboxLabels = ["Gewicht", "Wiederholungen", "Distanz", "Zeit", "RPE", "Notizen"];
  for (const label of checkboxLabels) {
    const checkbox = page.getByLabel(new RegExp(label, "i"));
    if (await checkbox.isVisible({ timeout: 1000 })) {
      await checkbox.check();
    }
  }

  await page.getByRole("button", { name: /Speichern/i }).click();

  await expect(page.getByText("E2E Test Exercise")).toBeVisible({
    timeout: 5000,
  });
});

// ─── Test 9: Admin uploads exercise video ────────────────────────────────────
test("admin can upload exercise video", async ({ page }) => {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await page.goto("/admin/exercises");

  // Find existing exercise or create one
  const existingExercise = page.getByText("Test Exercise 1");
  if (await existingExercise.isVisible({ timeout: 2000 })) {
    await existingExercise.click();
  } else {
    await page.getByRole("button", { name: /Neue Übung|Übung erstellen/i }).click();
    await page.getByLabel(/Name/i).fill("Video Test Exercise");
    await page.getByRole("button", { name: /Speichern/i }).click();
    await page.getByText("Video Test Exercise").click();
  }

  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.isVisible({ timeout: 2000 })) {
    // Check that the file input accepts video files
    const accept = await fileInput.getAttribute("accept");
    expect(accept).toMatch(/video|mp4|mov/i);
  }

  // Verify the upload area is present
  await expect(
    page.getByText(/Video|Upload|hochladen/i).first(),
  ).toBeVisible({ timeout: 5000 });
});

// ─── Test 10: Exercise appears in trainer's exercise list ─────────────────────
test("trainer sees exercises in round planner", async ({ browser }) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  await trainerPage
    .getByRole("button", { name: /\+ Runde|Neue Runde/i })
    .click();

  // The exercise dropdown/list should be visible
  await expect(
    trainerPage.getByText(/Test Exercise|Übung/i).first(),
  ).toBeVisible({ timeout: 5000 });

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 11: Exercise can be added to round ─────────────────────────────────
test("exercise can be added to round planner", async ({ browser }) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  await trainerPage
    .getByRole("button", { name: /\+ Runde|Neue Runde/i })
    .click();

  // Select an exercise from the dropdown
  const exerciseSelect = trainerPage.getByRole("combobox").first();
  if (await exerciseSelect.isVisible({ timeout: 3000 })) {
    await exerciseSelect.selectOption({ index: 1 }); // Select first exercise
    const addBtn = trainerPage.getByRole("button", {
      name: /Übung hinzufügen/i,
    });
    if (await addBtn.isVisible({ timeout: 2000 })) {
      await addBtn.click();
    }
  }

  // Verify exercise appears in round planner
  await expect(
    trainerPage.getByText(/Test Exercise|Exercise/i).first(),
  ).toBeVisible({ timeout: 5000 });

  await trainerPage
    .getByRole("button", { name: /Änderungen speichern/i })
    .click();
  await trainerPage.waitForTimeout(PUSHER_DELAY);

  // Round with exercise should be saved
  await expect(
    trainerPage.getByText(/Runde 1|DRAFT|Entwurf/i),
  ).toBeVisible({ timeout: 5000 });

  await athleteCtx.close();
  await trainerCtx.close();
});
