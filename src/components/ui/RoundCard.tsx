"use client";

import FeedbackSummary from "./FeedbackSummary";

type Exercise = {
  id: string;
  difficulty?: any;
  hadPain: boolean;
  painRegions: any[];
  athleteNotes?: string | null;
  exercise: {
    name: string;
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
  isSelected: boolean;
  onClick: () => void;
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-800 border-gray-700",
  RELEASED: "bg-emerald-500/10 border-emerald-500/30",
  ACTIVE: "bg-blue-500/10 border-blue-500/30",
  COMPLETED: "bg-gray-700 border-gray-600",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  RELEASED: "Freigegeben",
  ACTIVE: "Aktiv",
  COMPLETED: "Abgeschlossen",
};

const statusBadgeColors: Record<string, string> = {
  DRAFT: "bg-gray-600/20 text-gray-400 border-gray-600/30",
  RELEASED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ACTIVE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function RoundCard({ round, isSelected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        statusColors[round.status]
      } ${isSelected ? "ring-2 ring-emerald-500" : "hover:border-gray-600"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">Runde {round.roundNumber}</h4>
          {round.isFinalRound && (
            <span className="text-xs font-mono px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded">
              LETZTE RUNDE
            </span>
          )}
        </div>
        <span
          className={`px-2 py-1 border rounded text-xs font-medium ${statusBadgeColors[round.status]}`}
        >
          {statusLabels[round.status]}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3">
        {round.exercises.length} Übung{round.exercises.length !== 1 ? "en" : ""}
      </p>

      {/* Show feedback summary for completed rounds */}
      {round.status === "COMPLETED" && round.exercises.length > 0 && (
        <FeedbackSummary exercises={round.exercises} />
      )}
    </div>
  );
}
