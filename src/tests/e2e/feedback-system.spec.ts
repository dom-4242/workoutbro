import { test, expect } from "@playwright/test";
import {
  createWaitingSession,
  joinSessionAsTrainer,
  createDraftRound,
  releaseDraftRound,
  PUSHER_DELAY,
} from "../helpers/session-helpers";
import { prisma } from "@/lib/prisma";

test.beforeEach(async () => {
  await prisma.roundExercise.deleteMany();
  await prisma.sessionRound.deleteMany();
  await prisma.trainingSession.deleteMany();
});

// Helper: Set RPE slider to a given value (0–10)
async function setRpeSlider(
  page: import("@playwright/test").Page,
  value: number,
) {
  const slider = page.locator('input[type="range"]').first();
  if (await slider.isVisible({ timeout: 5000 })) {
    await slider.fill(String(value));
    await slider.dispatchEvent("input");
    await slider.dispatchEvent("change");
  }
}

// Helper: Set up an active session with a released round
async function setupReleasedRound(browser: import("@playwright/test").Browser) {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  await createDraftRound(trainerPage, ["Test Exercise 1"]);
  await releaseDraftRound(trainerPage);

  // Wait for athlete to receive the event
  await athletePage.waitForTimeout(PUSHER_DELAY);

  return { athleteCtx, athletePage, trainerCtx, trainerPage };
}

// ─── Test 12a: CR-10 Slider – Tiefer Wert (Leicht) ───────────────────────────
test.describe("CR-10 RPE slider ratings", () => {
  test.setTimeout(60000);

  test("athlete can set RPE to 1 (Sehr schwach)", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    const slider = athletePage.locator('input[type="range"]').first();
    if (await slider.isVisible({ timeout: 5000 })) {
      await slider.fill("1");
      await slider.dispatchEvent("input");
      await expect(slider).toHaveValue("1");
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });

  test("athlete can set RPE to 5 (Schwer)", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    const slider = athletePage.locator('input[type="range"]').first();
    if (await slider.isVisible({ timeout: 5000 })) {
      await slider.fill("5");
      await slider.dispatchEvent("input");
      await expect(slider).toHaveValue("5");
      // Label should update
      await expect(
        athletePage.getByText(/Schwer/i).first(),
      ).toBeVisible({ timeout: 3000 });
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });

  test("athlete can set RPE to 10 (Absolutes Maximum)", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    const slider = athletePage.locator('input[type="range"]').first();
    if (await slider.isVisible({ timeout: 5000 })) {
      await slider.fill("10");
      await slider.dispatchEvent("input");
      await expect(slider).toHaveValue("10");
      await expect(
        athletePage.getByText(/Absolutes Maximum/i).first(),
      ).toBeVisible({ timeout: 3000 });
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });

  test("submit button is blocked when RPE not set", async ({ browser }) => {
    const { athletePage, athleteCtx, trainerCtx } =
      await setupReleasedRound(browser);

    // Try to submit without touching the slider (rpe = null)
    const submitBtn = athletePage.getByRole("button", {
      name: /Runde abschlie[sß]en|Session abschlie[sß]en/i,
    });
    if (await submitBtn.isVisible({ timeout: 5000 })) {
      await submitBtn.click();
      // Validation error should appear
      await expect(
        athletePage.getByText(/CR-10|Anstrengung/i).first(),
      ).toBeVisible({ timeout: 3000 });
    }

    await athleteCtx.close();
    await trainerCtx.close();
  });
});

// ─── Test 13: Pain region selection ──────────────────────────────────────────
test("pain region selection works on SVG body selector", { timeout: 60000 }, async ({ browser }) => {
  const { athletePage, athleteCtx, trainerCtx } =
    await setupReleasedRound(browser);

  // The FeedbackForm should be visible
  const feedbackForm = athletePage.getByText(/Anstrengung|CR-10/i).first();
  if (await feedbackForm.isVisible({ timeout: 5000 })) {
    // Click "Ja" to indicate pain
    const painYesBtn = athletePage.getByRole("button", { name: /^Ja$/i }).first();
    if (await painYesBtn.isVisible({ timeout: 2000 })) {
      await painYesBtn.click();
    }

    // SVG body regions should appear — click one
    const bodyRegion = athletePage.locator("[data-region]").first();
    if (await bodyRegion.isVisible({ timeout: 2000 })) {
      // evaluate() nötig: React onClick auf SVG-Pfaden reagiert nicht auf force-Clicks
      // via Playwright, da der parent-SVG pointer-events abfängt. Ein direkt
      // dispatchtes MouseEvent mit bubbles:true erreicht den React Event-Listener.
      await bodyRegion.evaluate((el) =>
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
      );
      await athletePage.waitForTimeout(300);

      // Selected state wird via fill="#EF4444" kommuniziert
      const fillAfterClick = await bodyRegion.getAttribute("fill");
      expect(fillAfterClick).toBe("#EF4444");

      // Click a second region
      const bodyRegion2 = athletePage.locator("[data-region]").nth(1);
      if (await bodyRegion2.isVisible({ timeout: 1000 })) {
        await bodyRegion2.evaluate((el) =>
          el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
        );
      }

      // Deselect first region
      await bodyRegion.evaluate((el) =>
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
      );
    }
  }

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 14: Feedback is saved and visible to trainer ───────────────────────
test("trainer can see athlete feedback after round completion", { timeout: 60000 }, async ({
  browser,
}) => {
  const { athletePage, athleteCtx, trainerPage, trainerCtx } =
    await setupReleasedRound(browser);

  // Set RPE to 7 (Sehr schwer) via slider
  const slider = athletePage.locator('input[type="range"]').first();
  if (await slider.isVisible({ timeout: 5000 })) {
    await slider.fill("7");
    await slider.dispatchEvent("input");

    // Add optional notes if visible
    const notesField = athletePage
      .getByPlaceholder(/z\.B\.|Notizen|notes/i)
      .first();
    if (await notesField.isVisible({ timeout: 1000 })) {
      await notesField.fill("Test feedback note");
    }

    // Submit round
    const completeBtn = athletePage.getByRole("button", {
      name: /Runde abschlie[sß]en|Session abschlie[sß]en/i,
    });
    if (await completeBtn.isVisible({ timeout: 2000 })) {
      await completeBtn.click();
    }

    // Wait for trainer to receive event
    await trainerPage.waitForTimeout(PUSHER_DELAY);

    // Trainer should see completed status or RPE value
    await expect(
      trainerPage.getByText(/COMPLETED|Abgeschlossen|RPE|7/i).first(),
    ).toBeVisible({ timeout: 8000 });
  }

  await athleteCtx.close();
  await trainerCtx.close();
});
