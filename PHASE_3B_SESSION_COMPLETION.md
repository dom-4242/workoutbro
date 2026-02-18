# Phase 3b Feature: Session Completion

## Requirements

Add functionality to mark a session as COMPLETED when the final round is finished.

## Implementation

### 1. Database Schema Update

Add field to `SessionRound` model in `prisma/schema.prisma`:

```prisma
model SessionRound {
  id          String       @id @default(cuid())
  roundNumber Int
  status      RoundStatus  @default(DRAFT)
  isFinalRound Boolean     @default(false)  // NEW

  sessionId   String
  session     TrainingSession @relation(...)

  releasedAt  DateTime?
  completedAt DateTime?

  exercises   RoundExercise[]

  @@unique([sessionId, roundNumber])
  @@index([sessionId, status])
}
```

**Migration:**

```bash
npx prisma migrate dev --name add_is_final_round_to_session_round
```

---

### 2. Update RoundPlanner Component

**File:** `src/components/ui/RoundPlanner.tsx`

Add checkbox before "Runde freigeben" button:

```tsx
{
  round.status === "DRAFT" && (
    <>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFinalRound}
          onChange={(e) => setIsFinalRound(e.target.checked)}
          className="accent-emerald-500"
        />
        <span className="text-gray-400">
          Dies ist die letzte Runde der Session
        </span>
      </label>

      <button type="button" onClick={() => handleRelease(isFinalRound)}>
        Runde freigeben
      </button>
    </>
  );
}
```

**State:**

```tsx
const [isFinalRound, setIsFinalRound] = useState(false);
```

---

### 3. Update Server Actions

**File:** `src/lib/actions/session.ts`

#### Update `saveRound` to accept `isFinalRound`:

```typescript
export async function saveRound(data: {
  sessionId: string;
  roundId?: string;
  isFinalRound?: boolean;  // NEW
  exercises: Array<{...}>;
}) {
  // ... existing validation ...

  if (data.roundId) {
    // Update existing
    await prisma.sessionRound.update({
      where: { id: data.roundId },
      data: {
        isFinalRound: data.isFinalRound ?? false,  // NEW
        exercises: {
          deleteMany: {},
          create: data.exercises,
        },
      },
    });
  } else {
    // Create new
    await prisma.sessionRound.create({
      data: {
        sessionId: data.sessionId,
        roundNumber: nextNumber,
        status: "DRAFT",
        isFinalRound: data.isFinalRound ?? false,  // NEW
        exercises: {
          create: data.exercises,
        },
      },
    });
  }

  // ... revalidation ...
}
```

#### Update `completeRound` to check if session should complete:

```typescript
export async function completeRound(data: {
  roundId: string;
  feedback: Array<{...}>;
}) {
  const session = await requireAuth();
  const athleteId = (session.user as any).id;

  // ... existing validation ...

  // Mark round as completed
  await prisma.sessionRound.update({
    where: { id: data.roundId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // NEW: Check if this was the final round
  const completedRound = await prisma.sessionRound.findUnique({
    where: { id: data.roundId },
    select: { isFinalRound: true, sessionId: true },
  });

  if (completedRound?.isFinalRound) {
    // Mark entire session as completed
    await prisma.trainingSession.update({
      where: { id: completedRound.sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  revalidatePath(`/dashboard/session/${round.sessionId}`);
  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
}
```

---

### 4. UI Feedback

**Athlete View:** After completing final round, show success message:

```tsx
{
  session.status === "COMPLETED" && (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
      <h3 className="text-xl font-bold text-emerald-400 mb-2">
        🎉 Session abgeschlossen!
      </h3>
      <p className="text-gray-400 mb-4">
        Super gemacht! Alle Runden erfolgreich absolviert.
      </p>
      <Link
        href="/dashboard"
        className="inline-block px-6 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors"
      >
        Zurück zum Dashboard
      </Link>
    </div>
  );
}
```

**Trainer View:** Show indicator when round is marked as final:

```tsx
{
  round.isFinalRound && (
    <span className="text-xs font-mono px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded">
      LETZTE RUNDE
    </span>
  );
}
```

---

### 5. Dashboard Updates

**File:** `src/app/dashboard/page.tsx`

Don't show "Aktive Session fortsetzen" link if session is COMPLETED:

```typescript
const activeSession = await prisma.trainingSession.findFirst({
  where: {
    athleteId: (session.user as any).id,
    status: { in: ["WAITING", "ACTIVE"] }, // Not COMPLETED
  },
  // ...
});
```

Show completed sessions in history:

```tsx
const completedSessions = await prisma.trainingSession.findMany({
  where: {
    athleteId: (session.user as any).id,
    status: "COMPLETED",
  },
  orderBy: { completedAt: "desc" },
  take: 5,
});

// Show in dashboard:
{
  completedSessions.length > 0 && (
    <div className="mb-6">
      <h3 className="font-semibold mb-3">Letzte Sessions</h3>
      <div className="space-y-2">
        {completedSessions.map((s) => (
          <Link
            key={s.id}
            href={`/dashboard/session/${s.id}`}
            className="block p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700"
          >
            <div className="flex justify-between">
              <span>{new Date(s.startedAt).toLocaleDateString("de-CH")}</span>
              <Badge>ABGESCHLOSSEN</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] Trainer sees "Dies ist die letzte Runde" checkbox when releasing round
- [ ] Checkbox state is saved with round
- [ ] When athlete completes final round → session status = COMPLETED
- [ ] Athlete sees success message after final round
- [ ] Trainer sees "LETZTE RUNDE" indicator on round card
- [ ] Dashboard shows completed sessions in history
- [ ] "Aktive Session fortsetzen" link disappears after completion
- [ ] Can still view completed sessions (read-only)

---

## Testing

1. Trainer creates Round 1, does NOT check "letzte Runde" → releases
2. Athlete completes Round 1
3. Session stays ACTIVE ✓
4. Trainer creates Round 2, CHECKS "letzte Runde" → releases
5. Athlete completes Round 2
6. Session becomes COMPLETED ✓
7. Athlete sees success message
8. Dashboard shows session in history
9. Both can still view session (but no new rounds can be added)
