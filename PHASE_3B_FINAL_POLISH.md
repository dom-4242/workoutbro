# Phase 3b Final Polish

## Bug Fixes

### Bug 1: Button text stuck after round completion

**Problem:** After completing Round 1, when Round 2 appears, the button still shows "Schliesse Runde ab" instead of "Runde abschliessen" until page refresh.

**Root Cause:** Component state (likely `isSubmitting` or similar) not reset when `exercises` prop changes.

**File:** `src/components/ui/FeedbackForm.tsx`

**Fix:** Reset all relevant state when exercises change (same fix as the feedback initialization):

```typescript
useEffect(() => {
  // Reset feedback
  setFeedback(
    Object.fromEntries(
      exercises.map((ex) => [
        ex.id,
        {
          difficulty: null,
          hadPain: false,
          painRegions: [],
          athleteNotes: "",
        },
      ]),
    ),
  );

  // Reset submission state
  setIsSubmitting(false); // or whatever controls the button text
  setError("");
}, [exercises]);
```

---

### Bug 2: Button should say "Session abschließen" on final round

**Problem:** Button always says "Runde abschließen" even when it's the final round of the session.

**Expected:** If `isFinalRound === true`, button should say "Session abschließen" instead.

**File:** `src/components/ui/FeedbackForm.tsx` or `ActiveRoundView.tsx`

**Implementation:**

Option A - Pass `isFinalRound` to FeedbackForm:

```tsx
// In ActiveRoundView.tsx
<FeedbackForm
  roundId={round.id}
  exercises={round.exercises}
  isFinalRound={round.isFinalRound} // NEW
/>;

// In FeedbackForm.tsx
type Props = {
  roundId: string;
  exercises: RoundExercise[];
  isFinalRound?: boolean; // NEW
};

export default function FeedbackForm({
  roundId,
  exercises,
  isFinalRound,
}: Props) {
  // ...

  const submitButtonText = isFinalRound
    ? "Session abschließen"
    : "Runde abschließen";

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? "..." : submitButtonText}
      </button>
    </form>
  );
}
```

Option B - Check in parent component:

```tsx
// In ActiveRoundView.tsx
const buttonText = round.isFinalRound
  ? "Session abschließen"
  : "Runde abschließen";

// Pass as prop to FeedbackForm
<FeedbackForm
  // ...
  submitButtonText={buttonText}
/>;
```

**Recommendation:** Option A (cleaner, component owns its button text logic)

---

## Testing

After fixes:

1. Complete Round 1
2. Round 2 appears
3. ✅ Button immediately shows "Runde abschließen" (not stuck)
4. Trainer marks Round 3 as "letzte Runde"
5. Athlete reaches Round 3
6. ✅ Button shows "Session abschließen"
7. Complete Round 3
8. ✅ Session completes correctly
