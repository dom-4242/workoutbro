"use client";

import { BodyRegion } from "@prisma/client";
import { CR10_LABELS, getCR10Style } from "@/lib/cr10";
import { regionLabels } from "@/lib/body-regions";

type Exercise = {
  id: string;
  rpe?: number | null;
  hadPain: boolean;
  painRegions: BodyRegion[];
  athleteNotes?: string | null;
  exercise: {
    name: string;
  };
};

type Round = {
  id: string;
  roundNumber: number;
  completedAt?: Date | null;
  exercises: Exercise[];
};

type Props = {
  rounds: Round[];
};

export default function CompletedRoundsHistory({ rounds }: Props) {
  if (rounds.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-500">Noch keine abgeschlossenen Runden</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Absolvierte Runden</h3>

      {rounds.map((round) => (
        <div
          key={round.id}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-5"
        >
          {/* Round Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Runde {round.roundNumber}</h4>
            {round.completedAt && (
              <span className="text-xs text-gray-400">
                {new Date(round.completedAt).toLocaleString("de-CH", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            {round.exercises.map((ex) => (
              <div
                key={ex.id}
                className="border border-gray-800 rounded-lg p-3"
              >
                <p className="font-medium mb-2">{ex.exercise.name}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {/* CR-10 Badge */}
                  {ex.rpe !== null && ex.rpe !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 border rounded text-xs font-medium ${getCR10Style(ex.rpe)}`}
                    >
                      <span className="font-bold">CR-10: {ex.rpe}</span>
                      <span className="opacity-80">· {CR10_LABELS[ex.rpe]}</span>
                    </span>
                  )}

                  {/* Pain Badge */}
                  {ex.hadPain && (
                    <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-medium">
                      Schmerzen: {ex.painRegions.map((r) => regionLabels[r]).join(", ")}
                    </span>
                  )}
                </div>

                {/* Athlete Notes */}
                {ex.athleteNotes && (
                  <p className="text-sm text-gray-400 italic">
                    "{ex.athleteNotes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
