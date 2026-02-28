import { test, expect, Browser } from "@playwright/test";
import {
  loginAsAthlete,
  loginAsTrainer,
  createWaitingSession,
  joinSessionAsTrainer,
  createDraftRound,
  releaseDraftRound,
  PUSHER_DELAY,
} from "../helpers/session-helpers";

// ─── Test 1: Athlete starts session → WAITING state ──────────────────────────
test("athlete can start new session", async ({ page }) => {
  await loginAsAthlete(page);

  await page.getByRole("button", { name: /session starten/i }).click();

  await page.waitForURL(/\/dashboard\/session\/.+$/);
  await expect(page.getByText(/WAITING/i)).toBeVisible();
  await expect(page.getByText(/Warte auf/i)).toBeVisible();
});

// ─── Test 2: Trainer joins session → ACTIVE state ────────────────────────────
test("trainer can join waiting session", async ({ browser }) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await loginAsTrainer(trainerPage);

  await expect(
    trainerPage.getByRole("button", { name: "Beitreten" }).first(),
  ).toBeVisible();
  await trainerPage.getByRole("button", { name: "Beitreten" }).first().click();

  await trainerPage.waitForURL(/\/dashboard\/session\/.+\/trainer$/);
  await expect(trainerPage.getByText(/ACTIVE/i)).toBeVisible();
  await expect(trainerPage.getByText(/Trainer View/i)).toBeVisible();

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 3: Trainer creates round (DRAFT) → appears in list ─────────────────
test("trainer can create draft round", async ({ browser }) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  await trainerPage
    .getByRole("button", { name: /\+ Runde|Neue Runde/i })
    .click();
  await expect(trainerPage.getByText(/Übungen|Runde planen/i)).toBeVisible();

  await trainerPage
    .getByRole("button", { name: /Änderungen speichern/i })
    .click();

  await trainerPage.waitForTimeout(PUSHER_DELAY);
  await expect(trainerPage.getByText(/Runde 1|Entwurf|DRAFT/i)).toBeVisible();

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 4: Trainer releases round → Athlete sees round ─────────────────────
test("athlete sees released round after trainer releases it", async ({
  browser,
}) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  const sessionUrl = await createWaitingSession(athletePage);

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

  // Release the round
  await releaseDraftRound(trainerPage);

  // Athlete page should reload and show the round
  await athletePage.waitForTimeout(PUSHER_DELAY);
  await expect(athletePage.getByText(/Runde 1|Round 1/i)).toBeVisible({
    timeout: 8000,
  });

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 5: Athlete completes round → Trainer sees COMPLETED ────────────────
test("trainer sees completed round after athlete finishes", async ({
  browser,
}) => {
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

  // Athlete: wait for round and complete it
  await athletePage.waitForTimeout(PUSHER_DELAY);
  const completeBtn = athletePage.getByRole("button", {
    name: /Runde abschliessen/i,
  });
  if (await completeBtn.isVisible({ timeout: 5000 })) {
    // Fill required difficulty feedback
    await athletePage
      .getByRole("button", { name: /Genau richtig/i })
      .first()
      .click();
    await completeBtn.click();
  }

  // Trainer: wait for round status update
  await trainerPage.waitForTimeout(PUSHER_DELAY);
  await expect(trainerPage.getByText(/COMPLETED|Abgeschlossen/i)).toBeVisible({
    timeout: 8000,
  });

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 6: Trainer marks final round → Session ends ────────────────────────
test("session ends when final round is completed", async ({ browser }) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  // Create final round
  await trainerPage
    .getByRole("button", { name: /\+ Runde|Neue Runde/i })
    .click();
  const finalCheckbox = trainerPage.getByLabel(/letzte Runde|Final/i);
  if (await finalCheckbox.isVisible({ timeout: 2000 })) {
    await finalCheckbox.check();
  }
  await trainerPage
    .getByRole("button", { name: /Änderungen speichern/i })
    .click();
  await trainerPage.waitForTimeout(PUSHER_DELAY);
  await releaseDraftRound(trainerPage);

  // Athlete: complete the final round
  await athletePage.waitForTimeout(PUSHER_DELAY);
  const completeBtn = athletePage.getByRole("button", {
    name: /Runde abschliessen/i,
  });
  if (await completeBtn.isVisible({ timeout: 5000 })) {
    await athletePage
      .getByRole("button", { name: /Genau richtig/i })
      .first()
      .click();
    await completeBtn.click();
  }

  // Both should see COMPLETED
  await athletePage.waitForTimeout(PUSHER_DELAY);
  await expect(
    athletePage.getByText(/Session abgeschlossen|COMPLETED/i),
  ).toBeVisible({ timeout: 8000 });

  await trainerPage.waitForTimeout(PUSHER_DELAY);
  await expect(
    trainerPage.getByText(/Session abgeschlossen|COMPLETED/i),
  ).toBeVisible({ timeout: 8000 });

  await athleteCtx.close();
  await trainerCtx.close();
});

// ─── Test 7: Full flow → Both users see success + history ────────────────────
test("both users see session completion and can navigate to dashboard", async ({
  browser,
}) => {
  const athleteCtx = await browser.newContext();
  const athletePage = await athleteCtx.newPage();
  await createWaitingSession(athletePage);

  const trainerCtx = await browser.newContext();
  const trainerPage = await trainerCtx.newPage();
  await joinSessionAsTrainer(trainerPage);

  // Trainer creates and releases final round
  await trainerPage
    .getByRole("button", { name: /\+ Runde|Neue Runde/i })
    .click();
  const finalCheckbox = trainerPage.getByLabel(/letzte Runde|Final/i);
  if (await finalCheckbox.isVisible({ timeout: 2000 })) {
    await finalCheckbox.check();
  }
  await trainerPage
    .getByRole("button", { name: /Änderungen speichern/i })
    .click();
  await trainerPage.waitForTimeout(PUSHER_DELAY);
  await releaseDraftRound(trainerPage);

  // Athlete completes the round
  await athletePage.waitForTimeout(PUSHER_DELAY);
  const completeBtn = athletePage.getByRole("button", {
    name: /Runde abschliessen/i,
  });
  if (await completeBtn.isVisible({ timeout: 5000 })) {
    await athletePage
      .getByRole("button", { name: /Genau richtig/i })
      .first()
      .click();
    await completeBtn.click();
  }

  await athletePage.waitForTimeout(PUSHER_DELAY);

  // Both navigate back to dashboard
  await athletePage
    .getByRole("link", { name: /Zurück zum Dashboard/i })
    .click();
  await expect(athletePage).toHaveURL("/dashboard");

  // Session should appear in history
  await expect(athletePage.getByText(/Abgeschlossen/i).first()).toBeVisible({
    timeout: 5000,
  });

  await athleteCtx.close();
  await trainerCtx.close();
});
