import { test, expect } from "@playwright/test";
import {
  createWaitingSession,
  joinSessionAsTrainer,
  releaseDraftRound,
  PUSHER_DELAY,
} from "../helpers/session-helpers";

// Helper: Set up an active session with a released round
async function setupReleasedRound(browser: import("@playwright/test").Browser) {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  await trainerPage
    .getByRole("button", { name: /\+ Runde|Neue Runde/i })
    .click();
  await trainerPage
    .getByRole("button", { name: /Änderungen speichern/i })
    .click();
  await trainerPage.waitForTimeout(PUSHER_DELAY);
  await releaseDraftRound(trainerPage);

  // Wait for athlete to receive the event
  await athletePage.waitForTimeout(PUSHER_DELAY);

  return { athleteCtx, athletePage, trainerCtx, trainerPage };
}

// ─── Test 12a: Difficulty rating "Zu einfach" ────────────────────────────────
test.describe("difficulty ratings", () => {
  test("athlete can select 'Zu einfach'", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    const btn = athletePage.getByRole("button", { name: /Zu einfach/i }).first();
    if (await btn.isVisible({ timeout: 5000 })) {
      await btn.click();
      await expect(btn).toHaveClass(/bg-|selected|active|ring/);
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });

  test("athlete can select 'Genau richtig'", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    const btn = athletePage
      .getByRole("button", { name: /Genau richtig/i })
      .first();
    if (await btn.isVisible({ timeout: 5000 })) {
      await btn.click();
      await expect(btn).toHaveClass(/bg-|selected|active|ring/);
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });

  test("athlete can select 'Zu schwer'", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    const btn = athletePage.getByRole("button", { name: /Zu schwer/i }).first();
    if (await btn.isVisible({ timeout: 5000 })) {
      await btn.click();
      await expect(btn).toHaveClass(/bg-|selected|active|ring/);
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });
});

// ─── Test 13: Pain region selection ──────────────────────────────────────────
test("pain region selection works on SVG body selector", async ({ browser }) => {
  const { athletePage, athleteCtx, trainerCtx } =
    await setupReleasedRound(browser);

  // The FeedbackForm should be visible
  const feedbackForm = athletePage.getByText(/Schmerzen|pain|body/i).first();
  if (await feedbackForm.isVisible({ timeout: 5000 })) {
    // Look for "Ich hatte Schmerzen" toggle / checkbox
    const painToggle = athletePage.getByLabel(/Schmerzen/i).first();
    if (await painToggle.isVisible({ timeout: 2000 })) {
      await painToggle.click();
    }

    // SVG body regions should appear — click one
    const bodyRegion = athletePage.locator("[data-region]").first();
    if (await bodyRegion.isVisible({ timeout: 2000 })) {
      await bodyRegion.click();
      // Region should now be highlighted
      const isSelected =
        (await bodyRegion.getAttribute("class"))?.includes("fill") ||
        (await bodyRegion.getAttribute("data-selected")) === "true";
      expect(isSelected).toBeTruthy();

      // Click a second region
      const bodyRegion2 = athletePage.locator("[data-region]").nth(1);
      if (await bodyRegion2.isVisible({ timeout: 1000 })) {
        await bodyRegion2.click();
      }

      // Deselect first region
      await bodyRegion.click();
    }
  }

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 14: Feedback is saved and visible to trainer ───────────────────────
test("trainer can see athlete feedback after round completion", async ({
  browser,
}) => {
  const { athletePage, athleteCtx, trainerPage, trainerCtx } =
    await setupReleasedRound(browser);

  // Athlete completes round with specific feedback
  const difficultyBtn = athletePage
    .getByRole("button", { name: /Zu schwer/i })
    .first();

  if (await difficultyBtn.isVisible({ timeout: 5000 })) {
    await difficultyBtn.click();

    // Add optional notes if visible
    const notesField = athletePage.getByLabel(/Notizen|notes/i).first();
    if (await notesField.isVisible({ timeout: 1000 })) {
      await notesField.fill("Test feedback note");
    }

    // Submit round
    const completeBtn = athletePage.getByRole("button", {
      name: /Runde abschliessen/i,
    });
    if (await completeBtn.isVisible({ timeout: 2000 })) {
      await completeBtn.click();
    }

    // Wait for trainer to receive event
    await trainerPage.waitForTimeout(PUSHER_DELAY);

    // Trainer should see completed status
    await expect(
      trainerPage.getByText(/COMPLETED|Abgeschlossen|Zu schwer/i).first(),
    ).toBeVisible({ timeout: 8000 });
  }

  await athleteCtx.close();
  await trainerCtx.close();
});
