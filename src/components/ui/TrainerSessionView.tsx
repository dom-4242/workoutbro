"use client";

import { useState } from "react";
import RoundCard from "./RoundCard";
import RoundPlanner from "./RoundPlanner";

type Exercise = {
  id: string;
  name: string;
  requiredFields: any[];
};

type Round = {
  id: string;
  roundNumber: number;
  status: string;
  isFinalRound: boolean;
  exercises: any[];
};

type Props = {
  sessionId: string;
  athleteName: string;
  startedAt: Date;
  joinedAt?: Date | null;
  rounds: Round[];
  availableExercises: Exercise[];
};

export default function TrainerSessionView({
  sessionId,
  athleteName,
  startedAt,
  joinedAt,
  rounds,
  availableExercises,
}: Props) {
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [showNewRoundPlanner, setShowNewRoundPlanner] = useState(false);

  const selectedRound = rounds.find((r) => r.id === selectedRoundId);

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-5">
        <h2 className="text-xl font-bold mb-2">{athleteName}</h2>
        <div className="text-sm text-gray-400 space-y-1">
          <p>
            Session gestartet:{" "}
            {new Date(startedAt).toLocaleString("de-CH", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {joinedAt && (
            <p>
              Beigetreten:{" "}
              {new Date(joinedAt).toLocaleString("de-CH", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rounds List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-semibold mb-3">Runden</h3>

          {rounds.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center text-gray-500 text-sm">
              Noch keine Runden erstellt
            </div>
          ) : (
            <div className="space-y-2">
              {rounds.map((round) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  isSelected={selectedRoundId === round.id}
                  onClick={() => {
                    setSelectedRoundId(round.id);
                    setShowNewRoundPlanner(false);
                  }}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setSelectedRoundId(null);
              setShowNewRoundPlanner(true);
            }}
            className="w-full min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            + Neue Runde
          </button>
        </div>

        {/* Right: Detail View */}
        <div className="lg:col-span-8">
          {showNewRoundPlanner ? (
            <RoundPlanner
              key="new"
              sessionId={sessionId}
              availableExercises={availableExercises}
              onRoundCreated={(roundId) => {
                setShowNewRoundPlanner(false);
                setSelectedRoundId(roundId);
              }}
            />
          ) : selectedRound ? (
            <RoundPlanner
              key={selectedRound.id}
              sessionId={sessionId}
              availableExercises={availableExercises}
              round={selectedRound}
              onRoundDeleted={() => {
                setSelectedRoundId(null);
              }}
            />
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Wähle eine Runde aus oder erstelle eine neue
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
