# Phase 3b Bug Fixes & Improvements

## Context

Phase 3b was implemented and tested. Most features work, but several critical bugs and UX improvements were identified during Product Owner review.

## Critical Bugs to Fix

### Bug 1: Round cannot be released after saving

**Problem:** After clicking "Änderungen speichern" in RoundPlanner, both buttons ("Änderungen speichern" and "Runde freigeben") become inactive and the round cannot be released.

**Root cause:** Likely state management issue in RoundPlanner component or missing revalidation after save.

**Fix:**

- Ensure buttons remain active after save
- Verify round can be released after editing
- Check state updates and revalidation logic

**File:** `src/components/ui/RoundPlanner.tsx`

---

### Bug 2: Cannot delete draft rounds

**Problem:** No way to delete a round with status DRAFT. Trainer cannot correct mistakes.

**Requirements:**

- Add "Runde löschen" button to RoundPlanner (visible only for DRAFT rounds)
- Add confirmation dialog: "Runde wirklich löschen?"
- Server action to delete round + all exercises
- Revalidate after deletion

**Files:**

- `src/components/ui/RoundPlanner.tsx` (add delete button)
- `src/lib/actions/session.ts` (add deleteRound action)

---

### Bug 3: Cannot create next round while athlete executes current

**Problem:** "+ Runde" button doesn't work. Trainer cannot plan Round 2 while athlete does Round 1.

**Expected behavior:** Trainer can create multiple draft rounds. They remain invisible to athlete until released.

**Current behavior:** "+ Runde" button does nothing or throws error.

**Fix:**

- Debug "+ Runde" button click handler
- Ensure new round is created with correct roundNumber
- Verify multiple DRAFT rounds can coexist
- Test: Trainer creates Round 1 (releases) → creates Round 2 (draft) → Athlete only sees Round 1

**File:** `src/app/dashboard/session/[id]/trainer/page.tsx` or `TrainerSessionView.tsx`

---

## Important UX Improvements

### Improvement 1: Add session cancel functionality

**Problem:** Neither athlete nor trainer can abort an active session.

**Requirements:**

- Add "Session abbrechen" button for both athlete and trainer
- Confirmation dialog: "Session wirklich abbrechen? Dies kann nicht rückgängig gemacht werden."
- Server action: Set session status to CANCELLED
- Redirect both users to dashboard
- Show cancelled sessions in history with status badge

**Files:**

- `src/app/dashboard/session/[id]/page.tsx` (athlete view)
- `src/app/dashboard/session/[id]/trainer/page.tsx` (trainer view)
- `src/lib/actions/session.ts` (add cancelSession action)

**Implementation:**

```typescript
// session.ts
export async function cancelSession(sessionId: string) {
  const session = await requireAuth();
  const userId = (session.user as any).id;

  // Verify user is athlete or trainer of this session
  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: { athleteId: true, trainerId: true },
  });

  if (!trainingSession) throw new Error("Session nicht gefunden");

  const isAuthorized =
    trainingSession.athleteId === userId ||
    trainingSession.trainerId === userId;

  if (!isAuthorized) throw new Error("Keine Berechtigung");

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}
```

---

### Improvement 2: Persist session URL on refresh

**Problem:** After browser refresh, athlete cannot re-enter their active session.

**Requirements:**

- Dashboard shows link to active session if one exists
- Both athlete and trainer see "Aktive Session fortsetzen →" button
- Clicking redirects to correct session view

**Files:**

- `src/app/dashboard/page.tsx`

**Implementation:**

```tsx
// In dashboard/page.tsx, after existing queries:

// Check for active session
const activeSession = await prisma.trainingSession.findFirst({
  where: {
    athleteId: (session.user as any).id,
    status: { in: ["WAITING", "ACTIVE"] },
  },
  select: { id: true, status: true },
});

// In JSX, before "Session starten" button:
{
  activeSession && (
    <Link href={`/dashboard/session/${activeSession.id}`} className="...">
      Aktive Session fortsetzen →
    </Link>
  );
}
```

For trainer:

```tsx
const activeTrainerSession = await prisma.trainingSession.findFirst({
  where: {
    trainerId: (session.user as any).id,
    status: "ACTIVE",
  },
  select: { id: true, athlete: { select: { name: true } } },
});

// Show before ActiveSessionsList
```

---

### Improvement 3: Text adjustment for first vs next round

**Problem:** Always shows "Warte auf die nächste Runde vom Trainer…" even before first round.

**Requirements:**

- Before first round (no completed rounds): "Warte auf die erste Runde vom Trainer…"
- After completed rounds: "Warte auf die nächste Runde vom Trainer…"

**File:** `src/components/ui/WaitingForTrainer.tsx` or athlete session view

**Implementation:**

```tsx
const hasCompletedRounds = rounds.some((r) => r.status === "COMPLETED");
const waitingText = hasCompletedRounds
  ? "Warte auf die nächste Runde vom Trainer…"
  : "Warte auf die erste Runde vom Trainer…";
```

---

### Improvement 4: Clarify shoulders in body selector

**Problem:** "Schultern" not clearly visible as separate region in SVG.

**Current:** `NECK_SHOULDERS` exists but visual representation unclear.

**Options:**
A) Split into separate regions: `NECK`, `LEFT_SHOULDER`, `RIGHT_SHOULDER`
B) Make visual representation clearer (add label or highlight)

**Recommendation:** Option B (simpler, no migration needed)

**File:** `src/components/ui/BodyRegionSelector.tsx`

**Implementation:**

- Add text label "Nacken/Schultern" near the SVG region
- Or enlarge the clickable area
- Update regionLabels to be clearer: "Nacken & Schultern"

---

## Testing After Fixes

After implementation, verify:

### Bug Fixes

- [ ] Can edit draft round and release afterwards
- [ ] Can delete draft round with confirmation
- [ ] Can create Round 2 while athlete does Round 1
- [ ] Athlete only sees released rounds

### UX Improvements

- [ ] Both users can cancel session
- [ ] Dashboard shows link to active session after refresh
- [ ] Correct waiting text (erste vs nächste)
- [ ] Shoulders clearly selectable in body selector

---

## Priority

**High Priority (blocks testing):**

1. Bug 3: Cannot create next round
2. Bug 1: Cannot release after save
3. Improvement 2: Session URL persistence

**Medium Priority:** 4. Bug 2: Cannot delete rounds 5. Improvement 1: Cancel session

**Low Priority:** 6. Improvement 3: Text adjustment 7. Improvement 4: Shoulders clarity
