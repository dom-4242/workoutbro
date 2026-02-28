"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTrainerSession,
  getAvailableExercises,
} from "@/lib/actions/session";
import { TrainerSubscriber } from "@/components/ui/SessionPusherSubscriber";
import Link from "next/link";
import TrainerSessionView from "@/components/ui/TrainerSessionView";
import CancelSessionButton from "@/components/ui/CancelSessionButton";

type SessionData = Awaited<ReturnType<typeof getTrainerSession>>;
type ExerciseData = Awaited<ReturnType<typeof getAvailableExercises>>;

export default function TrainerSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionData>(null);
  const [exercises, setExercises] = useState<ExerciseData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [data, availableExercises] = await Promise.all([
          getTrainerSession(id),
          getAvailableExercises(),
        ]);
        if (!data) {
          router.push("/dashboard");
          return;
        }
        setSession(data);
        setExercises(availableExercises);
      } catch (error) {
        console.error("Error loading session:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Lädt Session...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const { status, athlete, rounds, startedAt, joinedAt } = session;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <TrainerSubscriber sessionId={id} />

      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ←
          </Link>
          <h1 className="text-lg md:text-xl font-bold">Trainer View</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              status === "WAITING"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : status === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : status === "CANCELLED"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
            }`}
          >
            {status}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Cancel Button for active sessions */}
        {(status === "WAITING" || status === "ACTIVE") && (
          <div className="mb-6 flex justify-end">
            <CancelSessionButton sessionId={id} />
          </div>
        )}

        {/* Waiting State */}
        {status === "WAITING" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
            <p className="text-yellow-400">
              Warte darauf, dass du der Session beitrittst...
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Gehe zurück zum Dashboard um beizutreten
            </p>
          </div>
        )}

        {/* Active State */}
        {status === "ACTIVE" && (
          <TrainerSessionView
            sessionId={id}
            athleteName={athlete.name}
            startedAt={startedAt}
            joinedAt={joinedAt}
            rounds={rounds}
            availableExercises={exercises}
          />
        )}

        {/* Completed State */}
        {status === "COMPLETED" && (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">
                Session abgeschlossen
              </h2>
              <p className="text-gray-400">
                {athlete.name} hat die Session erfolgreich abgeschlossen
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-block min-h-[44px] px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                Zurück zum Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Cancelled State */}
        {status === "CANCELLED" && (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                Session abgebrochen
              </h2>
              <p className="text-gray-400">
                Diese Session wurde abgebrochen.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-block min-h-[44px] px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                Zurück zum Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
