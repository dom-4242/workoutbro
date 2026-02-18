# Phase 3c Implementation: Real-time Updates with Pusher

## Context

Phase 3b implemented the complete training session flow, but users must manually refresh to see updates. Phase 3c adds real-time bidirectional communication using Pusher Channels.

## Current State

- ✅ Training sessions work with manual refresh
- ✅ Pusher account created with credentials in `.env`
- ✅ Events architecture defined

## Task

Integrate Pusher for live updates between trainer and athlete during training sessions.

---

## Dependencies

Install Pusher libraries:

```bash
npm install pusher pusher-js
```

---

## Environment Variables

Already configured in `.env`:

```
NEXT_PUBLIC_PUSHER_KEY="your-key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-secret"
```

---

## Implementation

### 1. Pusher Server Instance

**File:** `src/lib/pusher.ts` (NEW)

```typescript
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
```

---

### 2. Pusher Client Instance

**File:** `src/lib/pusher-client.ts` (NEW)

```typescript
import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  },
);
```

---

### 3. Event Types

**File:** `src/lib/pusher-events.ts` (NEW)

```typescript
// Event names
export const PUSHER_EVENTS = {
  // Trainer → Athlete
  ROUND_RELEASED: "round-released",
  ROUND_UPDATED: "round-updated",
  ROUND_DELETED: "round-deleted",
  SESSION_CANCELLED: "session-cancelled",

  // Athlete → Trainer
  ROUND_COMPLETED: "round-completed",
  SESSION_COMPLETED: "session-completed",
} as const;

// Event payloads
export type RoundReleasedEvent = {
  roundId: string;
  roundNumber: number;
};

export type RoundCompletedEvent = {
  roundId: string;
  roundNumber: number;
};

export type SessionCancelledEvent = {
  cancelledBy: "ATHLETE" | "TRAINER";
};

// Helper to get channel name
export function getSessionChannel(sessionId: string) {
  return `session-${sessionId}`;
}
```

---

### 4. Trigger Events in Server Actions

**File:** `src/lib/actions/session.ts`

Import Pusher at the top:

```typescript
import { pusherServer } from "@/lib/pusher";
import { PUSHER_EVENTS, getSessionChannel } from "@/lib/pusher-events";
```

#### Update `releaseRound`:

```typescript
export async function releaseRound(roundId: string) {
  // ... existing validation and update logic ...

  await prisma.sessionRound.update({
    where: { id: roundId },
    data: {
      status: "RELEASED",
      releasedAt: new Date(),
    },
  });

  // NEW: Trigger Pusher event
  const round = await prisma.sessionRound.findUnique({
    where: { id: roundId },
    select: { sessionId: true, roundNumber: true },
  });

  if (round) {
    await pusherServer.trigger(
      getSessionChannel(round.sessionId),
      PUSHER_EVENTS.ROUND_RELEASED,
      {
        roundId,
        roundNumber: round.roundNumber,
      },
    );
  }

  revalidatePath(`/dashboard/session/${round?.sessionId}/trainer`);
  revalidatePath(`/dashboard/session/${round?.sessionId}`);
}
```

#### Update `completeRound`:

```typescript
export async function completeRound(data: {
  roundId: string;
  feedback: Array<{...}>;
}) {
  // ... existing logic ...

  // Mark round as completed
  await prisma.sessionRound.update({
    where: { id: data.roundId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // NEW: Trigger Pusher event
  await pusherServer.trigger(
    getSessionChannel(round.sessionId),
    PUSHER_EVENTS.ROUND_COMPLETED,
    {
      roundId: data.roundId,
      roundNumber: round.roundNumber,
    }
  );

  // Check if final round
  const completedRound = await prisma.sessionRound.findUnique({
    where: { id: data.roundId },
    select: { isFinalRound: true, sessionId: true },
  });

  if (completedRound?.isFinalRound) {
    await prisma.trainingSession.update({
      where: { id: completedRound.sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // NEW: Trigger session completed event
    await pusherServer.trigger(
      getSessionChannel(completedRound.sessionId),
      PUSHER_EVENTS.SESSION_COMPLETED,
      {}
    );
  }

  revalidatePath(`/dashboard/session/${round.sessionId}`);
  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
}
```

#### Update `cancelSession`:

```typescript
export async function cancelSession(sessionId: string) {
  const session = await requireAuth();
  const userId = (session.user as any).id;

  // ... existing validation ...

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });

  // NEW: Trigger Pusher event
  const cancelledBy =
    trainingSession.athleteId === userId ? "ATHLETE" : "TRAINER";

  await pusherServer.trigger(
    getSessionChannel(sessionId),
    PUSHER_EVENTS.SESSION_CANCELLED,
    { cancelledBy },
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}
```

#### Update `deleteRound`:

```typescript
export async function deleteRound(roundId: string) {
  // ... existing validation ...

  const round = await prisma.sessionRound.findUnique({
    where: { id: roundId },
    select: { sessionId: true, roundNumber: true },
  });

  await prisma.sessionRound.delete({
    where: { id: roundId },
  });

  // NEW: Trigger Pusher event
  if (round) {
    await pusherServer.trigger(
      getSessionChannel(round.sessionId),
      PUSHER_EVENTS.ROUND_DELETED,
      {
        roundId,
        roundNumber: round.roundNumber,
      },
    );
  }

  revalidatePath(`/dashboard/session/${round?.sessionId}/trainer`);
}
```

#### Update `saveRound` (for edits):

```typescript
export async function saveRound(data: {...}) {
  // ... existing logic ...

  if (data.roundId) {
    // Update existing round
    await prisma.sessionRound.update({
      where: { id: data.roundId },
      data: {
        isFinalRound: data.isFinalRound ?? false,
        exercises: {
          deleteMany: {},
          create: data.exercises,
        },
      },
    });

    // NEW: Trigger update event for released rounds
    const round = await prisma.sessionRound.findUnique({
      where: { id: data.roundId },
      select: { status: true, sessionId: true, roundNumber: true },
    });

    if (round?.status === "RELEASED") {
      await pusherServer.trigger(
        getSessionChannel(data.sessionId),
        PUSHER_EVENTS.ROUND_UPDATED,
        {
          roundId: data.roundId,
          roundNumber: round.roundNumber,
        }
      );
    }
  }

  // ... rest of logic ...
}
```

---

### 5. Subscribe in Athlete View

**File:** `src/app/dashboard/session/[id]/page.tsx`

Add at the top:

```typescript
"use client"; // IMPORTANT: Must be client component for Pusher

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { PUSHER_EVENTS, getSessionChannel } from "@/lib/pusher-events";
```

Inside component, after state declarations:

```typescript
export default function AthleteSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const sessionId = params.id;

  // ... existing data fetching ...

  useEffect(() => {
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    // Trainer released new round
    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      console.log("Round released, refreshing...");
      router.refresh();
    });

    // Trainer updated existing round
    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      console.log("Round updated, refreshing...");
      router.refresh();
    });

    // Trainer cancelled session
    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("Session cancelled, redirecting...");
      router.push("/dashboard");
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  // ... rest of component ...
}
```

**IMPORTANT:** Page must be converted to Client Component. Move server-side data fetching to a separate Server Component or use an API route if needed. For simplicity, you can use `useEffect` with `fetch` or keep using Server Actions from client.

---

### 6. Subscribe in Trainer View

**File:** `src/app/dashboard/session/[id]/trainer/page.tsx`

Same pattern:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { PUSHER_EVENTS, getSessionChannel } from "@/lib/pusher-events";

export default function TrainerSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const sessionId = params.id;

  // ... existing logic ...

  useEffect(() => {
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    // Athlete completed round
    channel.bind(PUSHER_EVENTS.ROUND_COMPLETED, () => {
      console.log("Round completed, refreshing...");
      router.refresh();
    });

    // Session completed (final round)
    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      console.log("Session completed, refreshing...");
      router.refresh();
    });

    // Athlete cancelled session
    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("Session cancelled, redirecting...");
      router.push("/dashboard");
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  // ... rest of component ...
}
```

---

### 7. Handle Server/Client Component Split

**Problem:** Session pages are currently Server Components but need to be Client Components for Pusher.

**Solution A: Convert to Client Components**

Pages become `"use client"` and fetch data via Server Actions in `useEffect`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { getAthleteSession } from "@/lib/actions/session";

export default function AthleteSessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const data = await getAthleteSession(params.id);
      setSession(data);
      setLoading(false);
    }
    loadSession();
  }, [params.id]);

  useEffect(() => {
    // Pusher subscription
    const channel = pusherClient.subscribe(getSessionChannel(params.id));

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, async () => {
      const data = await getAthleteSession(params.id);
      setSession(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [params.id]);

  if (loading) return <div>Lädt...</div>;

  // ... render session ...
}
```

**Solution B: Hybrid Approach (Recommended)**

Keep Server Component for initial load, create Client Component wrapper for Pusher:

```typescript
// src/app/dashboard/session/[id]/page.tsx (Server Component)
import { PusherSubscriber } from "@/components/PusherSubscriber";

export default async function AthleteSessionPage({ params }: { params: { id: string } }) {
  const session = await getAthleteSession(params.id);

  return (
    <>
      <PusherSubscriber sessionId={params.id} />
      {/* ... existing JSX ... */}
    </>
  );
}

// src/components/PusherSubscriber.tsx (Client Component)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { PUSHER_EVENTS, getSessionChannel } from "@/lib/pusher-events";

export function PusherSubscriber({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      router.refresh();
    });

    // ... other events ...

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  return null; // Invisible component
}
```

**Recommendation:** Use Solution B (cleaner, preserves Server Components benefits)

---

## Testing

### Manual Test Flow

**Two browser windows: Athlete + Trainer**

1. Athlete starts session → Trainer sees immediately (already works with refresh)
2. Trainer joins session
3. Trainer creates Round 1 → clicks "Runde freigeben"
4. **✅ Athlete window updates automatically** (no refresh needed)
5. Athlete completes Round 1
6. **✅ Trainer window shows completion automatically**
7. Trainer creates Round 2, releases
8. **✅ Athlete sees Round 2 immediately**
9. Trainer cancels session
10. **✅ Athlete redirected to dashboard automatically**

### Debug Mode

Add console logs to verify events:

```typescript
channel.bind(PUSHER_EVENTS.ROUND_RELEASED, (data) => {
  console.log("📡 Received round-released:", data);
  router.refresh();
});
```

Check browser console for Pusher connection status:

```typescript
pusherClient.connection.bind("connected", () => {
  console.log("✅ Connected to Pusher");
});

pusherClient.connection.bind("error", (err) => {
  console.error("❌ Pusher error:", err);
});
```

---

## Acceptance Criteria

- [ ] Pusher libraries installed
- [ ] Server and client Pusher instances configured
- [ ] Events triggered in all server actions
- [ ] Athlete view subscribes to session channel
- [ ] Trainer view subscribes to session channel
- [ ] Round release → Athlete sees immediately
- [ ] Round completion → Trainer sees immediately
- [ ] Session cancellation → Other party redirected
- [ ] No console errors in browser
- [ ] Pusher connection shown as "connected" in console

---

## Notes

- **Free tier:** 100 concurrent connections, 200k messages/day
- **Channels are private by default:** Anyone can subscribe to `session-{id}` channels (fine for our use case)
- **For production:** Consider Pusher private channels with authentication
- **Error handling:** If Pusher fails, app should still work with manual refresh
- **Cleanup:** Always unsubscribe in cleanup function to prevent memory leaks

---

## Questions Before Starting?

1. Confirm environment variables are set
2. Any concerns about converting pages to client components?
3. Prefer Solution A (full client) or Solution B (hybrid)?
