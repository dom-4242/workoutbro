# Phase 3b Hotfix: FeedbackForm State Initialization

## Bug

**Error:** `Cannot read properties of undefined (reading 'difficulty')`

**When:** Athlete completes Round 1 and Round 2 becomes visible.

**Root Cause:** FeedbackForm's `feedback` state is initialized once in `useState`, but not reset when `exercises` prop changes (new round).

**File:** `src/components/ui/FeedbackForm.tsx`

## Fix

Replace the `useState` initialization:

```typescript
// BEFORE (wrong):
const [feedback, setFeedback] = useState<Record<string, FeedbackState>>(
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

// AFTER (correct):
const [feedback, setFeedback] = useState<Record<string, FeedbackState>>({});

// Add useEffect to initialize/reset feedback when exercises change:
import { useEffect } from "react";

useEffect(() => {
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
}, [exercises]); // Re-run when exercises prop changes
```

## Testing

1. Complete Round 1
2. Round 2 appears
3. No error
4. Feedback form shows correctly for Round 2 exercises
