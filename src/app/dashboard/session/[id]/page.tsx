import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAthleteSession } from "@/lib/actions/session";
import Link from "next/link";
import WaitingForTrainer from "@/components/ui/WaitingForTrainer";
import ActiveRoundView from "@/components/ui/ActiveRoundView";
import CompletedRoundsHistory from "@/components/ui/CompletedRoundsHistory";
import CancelSessionButton from "@/components/ui/CancelSessionButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AthleteSessionPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const trainingSession = await getAthleteSession(id);

  if (!trainingSession) {
    redirect("/dashboard");
  }

  const { status, trainer, rounds } = trainingSession;

  // Separate rounds by status
  const activeRound = rounds.find((r) => r.status === "RELEASED");
  const completedRounds = rounds.filter((r) => r.status === "COMPLETED");

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
          <h1 className="text-lg md:text-xl font-bold">Training Session</h1>
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

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Cancel Button for active sessions */}
        {(status === "WAITING" || status === "ACTIVE") && (
          <div className="mb-6 flex justify-end">
            <CancelSessionButton sessionId={id} />
          </div>
        )}

        {/* Waiting State */}
        {status === "WAITING" && <WaitingForTrainer />}

        {/* Active State */}
        {status === "ACTIVE" && (
          <div className="space-y-8">
            {/* Trainer Joined Message */}
            {trainer && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                <p className="text-emerald-400 font-medium">
                  🎉 {trainer.name} ist beigetreten!
                </p>
              </div>
            )}

            {/* Active Round */}
            {activeRound ? (
              <ActiveRoundView round={activeRound} />
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">
                  {completedRounds.length > 0
                    ? "Warte auf die nächste Runde vom Trainer..."
                    : "Warte auf die erste Runde vom Trainer..."}
                </p>
              </div>
            )}

            {/* Completed Rounds History */}
            {completedRounds.length > 0 && (
              <CompletedRoundsHistory rounds={completedRounds} />
            )}
          </div>
        )}

        {/* Completed State */}
        {status === "COMPLETED" && (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">
                🎉 Session abgeschlossen!
              </h2>
              <p className="text-gray-400">Gut gemacht!</p>
            </div>

            {completedRounds.length > 0 && (
              <CompletedRoundsHistory rounds={completedRounds} />
            )}

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
