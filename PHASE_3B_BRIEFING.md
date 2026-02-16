# Phase 3b Implementation: Training Session Flow (without real-time)

## Context

WorkoutBro - Phase 3b implements the core training session workflow between athlete and trainer. This phase does NOT include real-time updates (Pusher) — users must manually refresh to see changes.

## Current State

- ✅ Exercise Management complete (Phase 3a)
- ✅ TrainingSession models migrated to database
- ✅ User has `athleteSessions` and `trainerSessions` relations

## Task

Build complete training session workflow with two distinct user experiences: Athlete and Trainer.

---

## Core Workflow

```
ATHLETE                          TRAINER
────────────────────────────────────────────────────
1. Clicks "Session starten"
   → Status: WAITING
   → Shows "Warte auf Trainer..."
                                 2. Sees "Dom: Session WAITING"
                                    Clicks "Beitreten"
                                    → Status: ACTIVE
                                    → joinedAt timestamp set

3. Sees "Trainer beigetreten!"
   → Waits for first round
                                 4. Plans Round 1:
                                    - Adds exercises
                                    - Sets values (weight, reps)
                                    - Clicks "Runde freigeben"
                                    → Round: DRAFT → RELEASED

5. Sees Round 1 (RELEASED)
   → Executes exercises
   → At end: Feedback for ALL exercises
     - Difficulty (mandatory)
     - Pain regions (if applicable)
   → Clicks "Runde abschließen"
   → Round: RELEASED → COMPLETED

                                 6. Sees Round 1: COMPLETED
                                    → Athlete feedback visible
                                    → Plans Round 2...

[Repeat until session complete]

7. All rounds done
   → Views history with feedback
```

---

## Route Structure

### New Routes

```
/dashboard/session/start          → POST: Create new session
/dashboard/session/[id]           → Athlete view
/dashboard/session/[id]/trainer   → Trainer view
```

### Modified Routes

```
/dashboard                        → Add "Session starten" button (Athlete)
                                  → Show active sessions list (Trainer)
```

---

## Data Model Reference

Already migrated — see `prisma/schema.prisma`:

- `TrainingSession` (WAITING/ACTIVE/COMPLETED/CANCELLED)
- `SessionRound` (DRAFT/RELEASED/ACTIVE/COMPLETED)
- `RoundExercise` (with planned values + feedback)
- Enums: `SessionStatus`, `RoundStatus`, `ExerciseDifficulty`, `BodyRegion`

---

## UI Components Overview

### Athlete Components

**1. SessionStartButton** (`/dashboard`)

```tsx
<button onClick={startSession}>🏋️ Training Session starten</button>
```

**2. WaitingForTrainer** (`/dashboard/session/[id]`)

```tsx
<div>
  <Spinner />
  <p>Warte auf Trainer...</p>
  <button onClick={refresh}>Aktualisieren</button>
</div>
```

**3. ActiveRoundView** (`/dashboard/session/[id]`)

```tsx
<div>
  <h2>Runde {roundNumber}</h2>
  {exercises.map((ex) => (
    <ExerciseCard
      video={ex.videoPath}
      name={ex.name}
      plannedWeight={ex.plannedWeight}
      plannedReps={ex.plannedReps}
    />
  ))}
  {allExercisesDone && <FeedbackForm />}
</div>
```

**4. FeedbackForm** (shown after all exercises executed)

```tsx
{
  exercises.map((ex) => (
    <div key={ex.id}>
      <h4>{ex.exercise.name}</h4>

      {/* Difficulty - MANDATORY */}
      <div>
        <label>Schwierigkeit:</label>
        <RadioGroup required>
          <Radio value="TOO_EASY">Zu leicht 😴</Radio>
          <Radio value="JUST_RIGHT">Genau richtig 💪</Radio>
          <Radio value="TOO_HARD">Zu schwer 😰</Radio>
        </RadioGroup>
      </div>

      {/* Pain - Optional but must select regions if "Yes" */}
      <div>
        <label>Schmerzen?</label>
        <Toggle onChange={(val) => setHadPain(val)}>
          <Option value={false}>Nein</Option>
          <Option value={true}>Ja</Option>
        </Toggle>

        {hadPain && <BodyRegionSelector />}
      </div>

      {/* Optional notes */}
      <textarea placeholder="Optionale Notizen..." />
    </div>
  ));
}

<button type="submit">Runde abschließen</button>;
```

**5. BodyRegionSelector** (CRITICAL COMPONENT)

See dedicated section below for SVG implementation.

**6. CompletedRoundsHistory**

```tsx
<div>
  <h3>Absolvierte Runden</h3>
  {completedRounds.map((round) => (
    <div key={round.id}>
      <h4>Runde {round.roundNumber}</h4>
      {round.exercises.map((ex) => (
        <div>
          <p>{ex.exercise.name}</p>
          <Badge>{ex.difficulty}</Badge>
          {ex.hadPain && (
            <Badge color="red">Schmerzen: {ex.painRegions.join(", ")}</Badge>
          )}
        </div>
      ))}
    </div>
  ))}
</div>
```

---

### Trainer Components

**1. ActiveSessionsList** (`/dashboard` for trainers)

```tsx
<div>
  <h3>Aktive Sessions</h3>
  {waitingSessions.map((session) => (
    <div key={session.id}>
      <p>{session.athlete.name}</p>
      <Badge>WAITING</Badge>
      <button onClick={() => joinSession(session.id)}>Beitreten</button>
    </div>
  ))}

  {activeSessions.map((session) => (
    <Link href={`/dashboard/session/${session.id}/trainer`}>
      {session.athlete.name} - Session läuft →
    </Link>
  ))}
</div>
```

**2. TrainerSessionView** (`/dashboard/session/[id]/trainer`)

Main view with three sections:

- Session Info (athlete name, status, started time)
- Rounds List (all rounds: DRAFT/RELEASED/ACTIVE/COMPLETED)
- Round Planner (for creating new rounds)

```tsx
<div className="grid grid-cols-12 gap-4">
  {/* Left: Rounds overview */}
  <div className="col-span-4">
    <h3>Runden</h3>
    {rounds.map((round) => (
      <RoundCard round={round} onClick={() => setSelectedRound(round)} />
    ))}
    <button onClick={createNewRound}>+ Neue Runde</button>
  </div>

  {/* Right: Detail view */}
  <div className="col-span-8">
    {selectedRound ? <RoundDetail round={selectedRound} /> : <RoundPlanner />}
  </div>
</div>
```

**3. RoundCard**

```tsx
<div className={statusColor[round.status]}>
  <h4>Runde {round.roundNumber}</h4>
  <Badge>{round.status}</Badge>
  <p>{round.exercises.length} Übungen</p>

  {round.status === "COMPLETED" && (
    <FeedbackSummary exercises={round.exercises} />
  )}
</div>
```

**4. RoundPlanner** (Create/Edit round)

```tsx
<form onSubmit={saveRound}>
  <h3>
    {editing ? `Runde ${round.roundNumber} bearbeiten` : "Neue Runde erstellen"}
  </h3>

  {exercises.map((ex, idx) => (
    <div key={idx}>
      {/* Exercise selector */}
      <Select
        value={ex.exerciseId}
        onChange={(id) => updateExercise(idx, "exerciseId", id)}
      >
        {availableExercises.map((ae) => (
          <option value={ae.id}>{ae.name}</option>
        ))}
      </Select>

      {/* Dynamic fields based on Exercise.requiredFields */}
      {selectedExercise.requiredFields.includes("WEIGHT") && (
        <Input
          type="number"
          label="Gewicht (kg)"
          value={ex.plannedWeight}
          onChange={(v) => updateExercise(idx, "plannedWeight", v)}
        />
      )}

      {selectedExercise.requiredFields.includes("REPS") && (
        <Input
          type="number"
          label="Wiederholungen"
          value={ex.plannedReps}
          onChange={(v) => updateExercise(idx, "plannedReps", v)}
        />
      )}

      {/* ... similar for DISTANCE, TIME, RPE */}

      <Input
        type="text"
        label="Notizen (optional)"
        value={ex.trainerNotes}
        onChange={(v) => updateExercise(idx, "trainerNotes", v)}
      />

      <button type="button" onClick={() => removeExercise(idx)}>
        Entfernen
      </button>
    </div>
  ))}

  <button type="button" onClick={addExercise}>
    + Übung hinzufügen
  </button>

  <div className="flex gap-2">
    <button type="submit">
      {round.status === "DRAFT" ? "Speichern" : "Änderungen speichern"}
    </button>

    {round.status === "DRAFT" && (
      <button type="button" onClick={releaseRound}>
        Runde freigeben
      </button>
    )}
  </div>
</form>
```

**5. FeedbackSummary** (shows athlete feedback)

```tsx
<div>
  {exercises.map((ex) => (
    <div key={ex.id}>
      <p className="font-medium">{ex.exercise.name}</p>

      <div className="flex gap-2">
        <Badge color={difficultyColor[ex.difficulty]}>
          {difficultyLabel[ex.difficulty]}
        </Badge>

        {ex.hadPain && (
          <Badge color="red">
            Schmerzen: {ex.painRegions.map((r) => regionLabel[r]).join(", ")}
          </Badge>
        )}
      </div>

      {ex.athleteNotes && (
        <p className="text-sm text-gray-400">{ex.athleteNotes}</p>
      )}
    </div>
  ))}
</div>
```

---

## Body Region Selector Implementation

**CRITICAL COMPONENT** - Must be intuitive and fast for athletes.

### SVG Body Silhouette

Create `src/components/ui/BodyRegionSelector.tsx`:

```tsx
"use client";

import { useState } from "react";
import { BodyRegion } from "@prisma/client";

type Props = {
  value: BodyRegion[];
  onChange: (regions: BodyRegion[]) => void;
};

// Region labels for display
const regionLabels: Record<BodyRegion, string> = {
  NECK_SHOULDERS: "Nacken/Schultern",
  CHEST: "Brust",
  UPPER_BACK: "Oberer Rücken",
  LOWER_BACK: "Unterer Rücken",
  ABS: "Bauch",
  LEFT_ARM: "Linker Arm",
  RIGHT_ARM: "Rechter Arm",
  LEFT_THIGH_FRONT: "Linker Oberschenkel vorne",
  LEFT_THIGH_BACK: "Linker Oberschenkel hinten",
  RIGHT_THIGH_FRONT: "Rechter Oberschenkel vorne",
  RIGHT_THIGH_BACK: "Rechter Oberschenkel hinten",
  LEFT_CALF: "Linke Wade",
  RIGHT_CALF: "Rechte Wade",
  LEFT_KNEE: "Linkes Knie",
  RIGHT_KNEE: "Rechtes Knie",
};

export default function BodyRegionSelector({ value, onChange }: Props) {
  const toggleRegion = (region: BodyRegion) => {
    const newValue = value.includes(region)
      ? value.filter((r) => r !== region)
      : [...value, region];
    onChange(newValue);
  };

  const isSelected = (region: BodyRegion) => value.includes(region);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Front view */}
      <div className="flex-1">
        <h4 className="text-sm font-medium mb-2">Vorderseite</h4>
        <svg viewBox="0 0 200 400" className="w-full max-w-[200px] mx-auto">
          {/* Head */}
          <ellipse
            cx="100"
            cy="30"
            rx="25"
            ry="30"
            fill="#374151"
            stroke="#9CA3AF"
            strokeWidth="2"
          />

          {/* Neck/Shoulders */}
          <path
            d="M 75 60 L 75 80 L 125 80 L 125 60"
            fill={isSelected("NECK_SHOULDERS") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("NECK_SHOULDERS")}
          />

          {/* Chest */}
          <rect
            x="70"
            y="80"
            width="60"
            height="50"
            fill={isSelected("CHEST") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("CHEST")}
          />

          {/* Abs */}
          <rect
            x="75"
            y="130"
            width="50"
            height="40"
            fill={isSelected("ABS") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("ABS")}
          />

          {/* Left Arm */}
          <rect
            x="35"
            y="80"
            width="30"
            height="100"
            rx="15"
            fill={isSelected("LEFT_ARM") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("LEFT_ARM")}
          />

          {/* Right Arm */}
          <rect
            x="135"
            y="80"
            width="30"
            height="100"
            rx="15"
            fill={isSelected("RIGHT_ARM") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("RIGHT_ARM")}
          />

          {/* Left Thigh Front */}
          <rect
            x="70"
            y="170"
            width="25"
            height="80"
            rx="10"
            fill={isSelected("LEFT_THIGH_FRONT") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("LEFT_THIGH_FRONT")}
          />

          {/* Right Thigh Front */}
          <rect
            x="105"
            y="170"
            width="25"
            height="80"
            rx="10"
            fill={isSelected("RIGHT_THIGH_FRONT") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("RIGHT_THIGH_FRONT")}
          />

          {/* Left Knee */}
          <circle
            cx="82.5"
            cy="260"
            r="12"
            fill={isSelected("LEFT_KNEE") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("LEFT_KNEE")}
          />

          {/* Right Knee */}
          <circle
            cx="117.5"
            cy="260"
            r="12"
            fill={isSelected("RIGHT_KNEE") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("RIGHT_KNEE")}
          />

          {/* Left Calf */}
          <rect
            x="72"
            y="275"
            width="20"
            height="70"
            rx="10"
            fill={isSelected("LEFT_CALF") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("LEFT_CALF")}
          />

          {/* Right Calf */}
          <rect
            x="108"
            y="275"
            width="20"
            height="70"
            rx="10"
            fill={isSelected("RIGHT_CALF") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("RIGHT_CALF")}
          />
        </svg>
      </div>

      {/* Back view */}
      <div className="flex-1">
        <h4 className="text-sm font-medium mb-2">Rückseite</h4>
        <svg viewBox="0 0 200 400" className="w-full max-w-[200px] mx-auto">
          {/* Head (back) */}
          <ellipse
            cx="100"
            cy="30"
            rx="25"
            ry="30"
            fill="#374151"
            stroke="#9CA3AF"
            strokeWidth="2"
          />

          {/* Upper Back */}
          <rect
            x="70"
            y="60"
            width="60"
            height="50"
            fill={isSelected("UPPER_BACK") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("UPPER_BACK")}
          />

          {/* Lower Back */}
          <rect
            x="75"
            y="110"
            width="50"
            height="60"
            fill={isSelected("LOWER_BACK") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("LOWER_BACK")}
          />

          {/* Left Thigh Back */}
          <rect
            x="70"
            y="170"
            width="25"
            height="80"
            rx="10"
            fill={isSelected("LEFT_THIGH_BACK") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("LEFT_THIGH_BACK")}
          />

          {/* Right Thigh Back */}
          <rect
            x="105"
            y="170"
            width="25"
            height="80"
            rx="10"
            fill={isSelected("RIGHT_THIGH_BACK") ? "#EF4444" : "#4B5563"}
            stroke="#9CA3AF"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleRegion("RIGHT_THIGH_BACK")}
          />
        </svg>
      </div>

      {/* Selected regions list */}
      {value.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Ausgewählte Bereiche:</p>
          <div className="flex flex-wrap gap-2">
            {value.map((region) => (
              <span
                key={region}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400"
              >
                {regionLabels[region]}
                <button
                  onClick={() => toggleRegion(region)}
                  className="hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**SVG Notes:**

- Simple geometric shapes (rectangles, circles, ellipses)
- Front and back view side-by-side
- Clickable regions turn red when selected
- Touch-friendly (min 44px tap targets)
- Responsive (scales with container)
- Selected regions shown as removable badges below

---

## Server Actions

**File:** `src/lib/actions/session.ts`

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SessionStatus, RoundStatus } from "@prisma/client";

// Helper: Require auth
async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ATHLETE: Start new training session
export async function startTrainingSession() {
  const session = await requireAuth();
  const userId = (session.user as any).id;

  // Check if user has trainer assigned
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trainerId: true },
  });

  if (!user?.trainerId) {
    throw new Error("Kein Trainer zugewiesen");
  }

  // Check if user already has active session
  const existing = await prisma.trainingSession.findFirst({
    where: {
      athleteId: userId,
      status: { in: ["WAITING", "ACTIVE"] },
    },
  });

  if (existing) {
    throw new Error("Du hast bereits eine aktive Session");
  }

  // Create new session
  const newSession = await prisma.trainingSession.create({
    data: {
      athleteId: userId,
      status: "WAITING",
    },
  });

  revalidatePath("/dashboard");
  return newSession.id;
}

// TRAINER: Join waiting session
export async function joinTrainingSession(sessionId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify trainer access
  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { athlete: true },
  });

  if (!trainingSession) {
    throw new Error("Session nicht gefunden");
  }

  if (trainingSession.athlete.trainerId !== trainerId) {
    throw new Error("Das ist nicht dein Athlet");
  }

  if (trainingSession.status !== "WAITING") {
    throw new Error("Session ist nicht mehr verfügbar");
  }

  // Join session
  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: {
      trainerId,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}

// TRAINER: Create/update round
export async function saveRound(data: {
  sessionId: string;
  roundId?: string; // If editing existing
  exercises: Array<{
    exerciseId: string;
    order: number;
    plannedWeight?: number;
    plannedReps?: number;
    plannedDistance?: number;
    plannedTime?: number;
    plannedRPE?: number;
    trainerNotes?: string;
  }>;
}) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify trainer access
  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: data.sessionId },
    select: { trainerId: true },
  });

  if (trainingSession?.trainerId !== trainerId) {
    throw new Error("Keine Berechtigung");
  }

  if (data.roundId) {
    // Update existing round
    await prisma.sessionRound.update({
      where: { id: data.roundId },
      data: {
        exercises: {
          deleteMany: {}, // Remove old exercises
          create: data.exercises,
        },
      },
    });
  } else {
    // Create new round
    const maxRound = await prisma.sessionRound.findFirst({
      where: { sessionId: data.sessionId },
      orderBy: { roundNumber: "desc" },
      select: { roundNumber: true },
    });

    const nextNumber = (maxRound?.roundNumber ?? 0) + 1;

    await prisma.sessionRound.create({
      data: {
        sessionId: data.sessionId,
        roundNumber: nextNumber,
        status: "DRAFT",
        exercises: {
          create: data.exercises,
        },
      },
    });
  }

  revalidatePath(`/dashboard/session/${data.sessionId}/trainer`);
}

// TRAINER: Release round
export async function releaseRound(roundId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify access
  const round = await prisma.sessionRound.findUnique({
    where: { id: roundId },
    include: { session: true },
  });

  if (round?.session.trainerId !== trainerId) {
    throw new Error("Keine Berechtigung");
  }

  if (round.status !== "DRAFT") {
    throw new Error("Runde kann nicht mehr freigegeben werden");
  }

  // Validate: at least one exercise
  const exerciseCount = await prisma.roundExercise.count({
    where: { roundId },
  });

  if (exerciseCount === 0) {
    throw new Error("Runde muss mindestens eine Übung enthalten");
  }

  await prisma.sessionRound.update({
    where: { id: roundId },
    data: {
      status: "RELEASED",
      releasedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
  revalidatePath(`/dashboard/session/${round.sessionId}`);
}

// ATHLETE: Submit feedback and complete round
export async function completeRound(data: {
  roundId: string;
  feedback: Array<{
    exerciseId: string;
    difficulty: "TOO_EASY" | "JUST_RIGHT" | "TOO_HARD";
    hadPain: boolean;
    painRegions: string[];
    athleteNotes?: string;
  }>;
}) {
  const session = await requireAuth();
  const athleteId = (session.user as any).id;

  // Verify access
  const round = await prisma.sessionRound.findUnique({
    where: { id: data.roundId },
    include: { session: true, exercises: true },
  });

  if (round?.session.athleteId !== athleteId) {
    throw new Error("Keine Berechtigung");
  }

  if (round.status !== "RELEASED") {
    throw new Error("Runde ist nicht verfügbar");
  }

  // Validate: feedback for ALL exercises
  if (data.feedback.length !== round.exercises.length) {
    throw new Error("Feedback für alle Übungen erforderlich");
  }

  // Update all exercises with feedback
  await Promise.all(
    data.feedback.map((fb) =>
      prisma.roundExercise.update({
        where: { id: fb.exerciseId },
        data: {
          difficulty: fb.difficulty,
          hadPain: fb.hadPain,
          painRegions: fb.painRegions as any,
          athleteNotes: fb.athleteNotes,
          completedAt: new Date(),
        },
      }),
    ),
  );

  // Mark round as completed
  await prisma.sessionRound.update({
    where: { id: data.roundId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/session/${round.sessionId}`);
  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
}

// Query: Get session for athlete
export async function getAthleteSession(sessionId: string) {
  const session = await requireAuth();
  const athleteId = (session.user as any).id;

  return await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      athleteId,
    },
    include: {
      trainer: { select: { name: true } },
      rounds: {
        where: {
          status: { in: ["RELEASED", "ACTIVE", "COMPLETED"] },
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });
}

// Query: Get session for trainer
export async function getTrainerSession(sessionId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  return await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      trainerId,
    },
    include: {
      athlete: { select: { name: true } },
      rounds: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });
}

// Query: Get active sessions for trainer
export async function getTrainerActiveSessions() {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  const waiting = await prisma.trainingSession.findMany({
    where: {
      athlete: { trainerId },
      status: "WAITING",
    },
    include: { athlete: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
  });

  const active = await prisma.trainingSession.findMany({
    where: {
      trainerId,
      status: "ACTIVE",
    },
    include: { athlete: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
  });

  return { waiting, active };
}
```

---

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                    # Add session button/list
│   │   └── session/
│   │       ├── start/
│   │       │   └── route.ts            # POST: startTrainingSession
│   │       └── [id]/
│   │           ├── page.tsx            # Athlete view
│   │           └── trainer/
│   │               └── page.tsx        # Trainer view
├── components/
│   └── ui/
│       ├── BodyRegionSelector.tsx      # SVG body silhouette
│       ├── SessionStartButton.tsx      # Athlete: start session
│       ├── WaitingForTrainer.tsx       # Athlete: waiting screen
│       ├── ActiveRoundView.tsx         # Athlete: current round
│       ├── FeedbackForm.tsx            # Athlete: exercise feedback
│       ├── CompletedRoundsHistory.tsx  # Athlete: history
│       ├── ActiveSessionsList.tsx      # Trainer: waiting sessions
│       ├── TrainerSessionView.tsx      # Trainer: main view
│       ├── RoundCard.tsx               # Trainer: round overview
│       ├── RoundPlanner.tsx            # Trainer: create/edit round
│       └── FeedbackSummary.tsx         # Trainer: athlete feedback
└── lib/
    └── actions/
        └── session.ts                  # All session server actions
```

---

## Important Implementation Notes

### 1. No Real-time Updates

Users must manually refresh to see changes:

- Athlete: "Aktualisieren" button while waiting
- Both: Automatic refresh after actions (via revalidatePath)
- Phase 3c will add Pusher for live updates

### 2. Required Fields Handling

Exercise.requiredFields determines which inputs to show:

```tsx
{exercise.requiredFields.includes('WEIGHT') && (
  <Input label="Gewicht (kg)" ... />
)}
```

### 3. Feedback Validation

- Difficulty: Always required (radio group)
- Pain: Optional toggle, but if "Yes" → at least one region required
- Athlete notes: Always optional

### 4. Round Status Flow

```
DRAFT → (trainer releases) → RELEASED → (athlete completes) → COMPLETED
```

Athlete only sees RELEASED, ACTIVE, COMPLETED.

### 5. Mobile-first Design

- Body selector: Side-by-side on desktop, stacked on mobile
- Touch targets: min 44px
- Large tap areas for SVG regions

### 6. Error Handling

- "Kein Trainer zugewiesen" → Redirect to dashboard with message
- "Bereits aktive Session" → Show link to existing session
- "Runde muss mindestens eine Übung enthalten" → Inline error
- "Feedback für alle Übungen erforderlich" → Highlight missing

---

## Acceptance Criteria

### Athlete Flow

- [ ] Can start new training session
- [ ] Sees "waiting for trainer" screen with manual refresh
- [ ] Sees trainer joined notification
- [ ] Sees first released round with all exercises
- [ ] Videos loop automatically
- [ ] Can provide feedback for all exercises (difficulty + pain)
- [ ] Body region selector works (front + back view)
- [ ] Cannot complete round without feedback for ALL exercises
- [ ] Sees completed rounds in history with own feedback
- [ ] Can only see one active round at a time

### Trainer Flow

- [ ] Sees list of waiting sessions on dashboard
- [ ] Can join waiting session
- [ ] Sees session view with rounds list
- [ ] Can create new round with exercises
- [ ] Dynamic input fields based on Exercise.requiredFields
- [ ] Can add/remove exercises in round
- [ ] Cannot release empty round
- [ ] Can release draft round
- [ ] Sees athlete's feedback after round completion
- [ ] Can plan next round while athlete executes current

### General

- [ ] Only athlete can start session for themselves
- [ ] Only assigned trainer can join/view session
- [ ] Session persists across page refreshes
- [ ] Responsive on mobile/tablet/desktop
- [ ] Body region selector touch-friendly on iPad
- [ ] All server actions have proper error handling
- [ ] revalidatePath called after mutations

---

## Testing Checklist

After implementation:

**As Athlete (Dom):**

1. Start session → Should see "Warte auf Trainer"
2. Refresh page → Still waiting
3. (Trainer joins in other window)
4. Refresh → See "Trainer beigetreten"
5. Wait for round release
6. Refresh → See Round 1 with exercises
7. Click body regions → Should select/deselect
8. Try to complete without feedback → Should fail
9. Provide feedback → Should succeed
10. See completed round in history

**As Trainer:**

1. See Dom's waiting session
2. Join session
3. Create Round 1
   - Add 2 exercises
   - Set values based on required fields
4. Try to release empty round → Should fail
5. Release round with exercises → Should succeed
6. See Round 1 status: RELEASED
7. (Athlete completes in other window)
8. Refresh → See feedback
9. Create Round 2 while athlete does Round 1

---

## Questions Before Starting?

1. Confirm Body Region SVG approach is acceptable
2. Confirm manual refresh is OK for Phase 3b
3. Any additional UI requirements?
4. Any changes to the workflow?
