"use client";

import FeedbackForm from "./FeedbackForm";

type Exercise = {
  id: string;
  order: number;
  plannedWeight?: number | null;
  plannedReps?: number | null;
  plannedDistance?: number | null;
  plannedTime?: number | null;
  plannedRPE?: number | null;
  trainerNotes?: string | null;
  exercise: {
    id: string;
    name: string;
    videoPath?: string | null;
  };
};

type Round = {
  id: string;
  roundNumber: number;
  status: string;
  isFinalRound: boolean;
  exercises: Exercise[];
};

type Props = {
  round: Round;
};

export default function ActiveRoundView({ round }: Props) {
  return (
    <div className="space-y-6">
      {/* Round Header */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <h2 className="text-xl font-bold text-emerald-400">
          Runde {round.roundNumber}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {round.exercises.length} Übung{round.exercises.length !== 1 ? "en" : ""}
        </p>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {round.exercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
          >
            {/* Video */}
            {ex.exercise.videoPath && (
              <div className="aspect-video bg-gray-950">
                <video
                  src={ex.exercise.videoPath}
                  loop
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Exercise Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-3">{ex.exercise.name}</h3>

              {/* Planned Values */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {ex.plannedWeight !== null && ex.plannedWeight !== undefined && (
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1">Gewicht</p>
                    <p className="font-medium">{ex.plannedWeight} kg</p>
                  </div>
                )}

                {ex.plannedReps !== null && ex.plannedReps !== undefined && (
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Wiederholungen
                    </p>
                    <p className="font-medium">{ex.plannedReps}x</p>
                  </div>
                )}

                {ex.plannedDistance !== null &&
                  ex.plannedDistance !== undefined && (
                    <div className="bg-gray-800 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-1">Distanz</p>
                      <p className="font-medium">{ex.plannedDistance} m</p>
                    </div>
                  )}

                {ex.plannedTime !== null && ex.plannedTime !== undefined && (
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1">Zeit</p>
                    <p className="font-medium">{ex.plannedTime} sek</p>
                  </div>
                )}

                {ex.plannedRPE !== null && ex.plannedRPE !== undefined && (
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-1">RPE</p>
                    <p className="font-medium">{ex.plannedRPE}/10</p>
                  </div>
                )}
              </div>

              {/* Trainer Notes */}
              {ex.trainerNotes && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-medium mb-1">
                    Hinweise vom Trainer:
                  </p>
                  <p className="text-sm text-gray-300">{ex.trainerNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Form */}
      <FeedbackForm roundId={round.id} exercises={round.exercises} isFinalRound={round.isFinalRound} />
    </div>
  );
}
