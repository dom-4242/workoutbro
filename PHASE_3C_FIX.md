# Phase 3c Fix: Client Component Conversion

## Problem

Session pages are Server Components but Pusher Subscribers are Client Components. The `useEffect` in Subscribers never runs because the parent is not client-rendered.

## Solution

Convert session pages to Client Components and fetch data via Server Actions in `useEffect`.

---

## File 1: Athlete Session Page

**File:** `src/app/dashboard/session/[id]/page.tsx`

Replace entire content with:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAthleteSession } from "@/lib/actions/session";
import { AthleteSubscriber } from "@/components/ui/SessionPusherSubscriber";
import Link from "next/link";
import WaitingForTrainer from "@/components/ui/WaitingForTrainer";
import ActiveRoundView from "@/components/ui/ActiveRoundView";
import CompletedRoundsHistory from "@/components/ui/CompletedRoundsHistory";
import CancelSessionButton from "@/components/ui/CancelSessionButton";

type SessionData = Awaited<ReturnType<typeof getAthleteSession>>;

export default function AthleteSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [session, setSession] = useState<SessionData>(null);
  const [loading, setLoading] = useState(true);

  // Load session data
  useEffect(() => {
    async function loadSession() {
      try {
        const data = await getAthleteSession(params.id);
        if (!data) {
          router.push("/dashboard");
          return;
        }
        setSession(data);
      } catch (error) {
        console.error("Error loading session:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [params.id, router]);

  // Reload session on Pusher events
  const reloadSession = async () => {
    const data = await getAthleteSession(params.id);
    setSession(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Lädt Session...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const activeRound = session.rounds.find((r) => r.status === "RELEASED");
  const completedRounds = session.rounds.filter((r) => r.status === "COMPLETED");

  return (
    <main className="min-h-screen bg-black text-white">
      <AthleteSubscriber sessionId={params.id} onUpdate={reloadSession} />

      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Dashboard
        </Link>
        <CancelSessionButton sessionId={params.id} userType="ATHLETE" />
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Session Info */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Training Session</h1>
          {session.trainer && (
            <p className="text-gray-400">
              Mit Trainer: <span className="text-white">{session.trainer.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-8">
          {/* Waiting State */}
          {session.status === "WAITING" && <WaitingForTrainer />}

          {/* Active Session */}
          {session.status === "ACTIVE" && (
            <>
              {activeRound ? (
                <ActiveRoundView round={activeRound} />
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 text-center">
                  <p className="text-gray-400 mb-2">
                    {completedRounds.length > 0
                      ? "Warte auf die nächste Runde vom Trainer..."
                      : "Warte auf die erste Runde vom Trainer..."}
                  </p>
                  <button
                    onClick={reloadSession}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    Aktualisieren
                  </button>
                </div>
              )}

              {/* Completed Rounds History */}
              {completedRounds.length > 0 && (
                <CompletedRoundsHistory rounds={completedRounds} />
              )}
            </>
          )}

          {/* Completed Session */}
          {session.status === "COMPLETED" && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 md:p-8 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-2">
                🎉 Session abgeschlossen!
              </h2>
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
          )}
        </div>
      </div>
    </main>
  );
}
```

---

## File 2: Update AthleteSubscriber

**File:** `src/components/ui/SessionPusherSubscriber.tsx`

Update `AthleteSubscriber` to accept callback:

```typescript
type Props = {
  sessionId: string;
  onUpdate?: () => void; // NEW
};

export function AthleteSubscriber({ sessionId, onUpdate }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.log("🚀 ATHLETE SUBSCRIBER MOUNTED for session:", sessionId);
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));
    console.log(
      "📡 Athlete subscribed to channel:",
      getSessionChannel(sessionId),
    );

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      console.log("📥 ROUND_RELEASED received");
      onUpdate?.(); // Call callback if provided
    });

    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      console.log("📥 ROUND_UPDATED received");
      onUpdate?.();
    });

    channel.bind(PUSHER_EVENTS.ROUND_DELETED, () => {
      console.log("📥 ROUND_DELETED received");
      onUpdate?.();
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("📥 SESSION_CANCELLED received");
      router.push("/dashboard");
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      console.log("📥 SESSION_COMPLETED received");
      onUpdate?.();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router, onUpdate]);

  return null;
}
```

Do the same for `TrainerSubscriber`.

---

## File 3: Trainer Session Page

**File:** `src/app/dashboard/session/[id]/trainer/page.tsx`

Convert to Client Component with same pattern as athlete page.

---

## Testing

After changes:

1. Login as athlete
2. Browser console should show: `"🚀 ATHLETE SUBSCRIBER MOUNTED"`
3. Start session
4. Trainer releases round
5. Console shows: `"📥 ROUND_RELEASED received"`
6. Athlete view updates automatically
