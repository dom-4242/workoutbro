import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTrainerSession } from "@/lib/actions/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TrainerSessionView from "@/components/ui/TrainerSessionView";
import CancelSessionButton from "@/components/ui/CancelSessionButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TrainerSessionPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const trainingSession = await getTrainerSession(id);

  if (!trainingSession) {
    redirect("/dashboard");
  }

  // Get all available exercises
  const availableExercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      requiredFields: true,
    },
  });

  const { status, athlete, rounds, startedAt, joinedAt } = trainingSession;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
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
            availableExercises={availableExercises}
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
