"use client";

import { useState, useEffect } from "react";
import { ExerciseDifficulty, BodyRegion } from "@prisma/client";
import BodyRegionSelector from "./BodyRegionSelector";
import { completeRound } from "@/lib/actions/session";
import { useRouter } from "next/navigation";

type Exercise = {
  id: string;
  exercise: {
    name: string;
  };
};

type Props = {
  roundId: string;
  exercises: Exercise[];
  isFinalRound?: boolean;
};

type FeedbackState = {
  difficulty: ExerciseDifficulty | null;
  hadPain: boolean;
  painRegions: BodyRegion[];
  athleteNotes: string;
};

export default function FeedbackForm({ roundId, exercises, isFinalRound }: Props) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Record<string, FeedbackState>>({});

  useEffect(() => {
    setFeedback(
      Object.fromEntries(
        exercises.map((ex) => [
          ex.id,
          {
            difficulty: null,
            hadPain: false,
            painRegions: [],
            athleteNotes: "",
          },
        ]),
      ),
    );
    setLoading(false);
    setError(null);
  }, [exercises]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFeedback = (
    exerciseId: string,
    field: keyof FeedbackState,
    value: any,
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate: all exercises must have difficulty
    const missingDifficulty = exercises.filter(
      (ex) => !feedback[ex.id]?.difficulty,
    );
    if (missingDifficulty.length > 0) {
      setError("Bitte bewerte die Schwierigkeit für alle Übungen");
      return;
    }

    // Validate: if hadPain, at least one region must be selected
    for (const ex of exercises) {
      if (feedback[ex.id]?.hadPain && feedback[ex.id]?.painRegions.length === 0) {
        setError(
          `Bitte wähle mindestens einen Schmerzbereich für "${ex.exercise.name}"`,
        );
        return;
      }
    }

    setLoading(true);

    try {
      await completeRound({
        roundId,
        feedback: exercises.map((ex) => ({
          exerciseId: ex.id,
          difficulty: feedback[ex.id].difficulty!,
          hadPain: feedback[ex.id].hadPain,
          painRegions: feedback[ex.id].painRegions,
          athleteNotes: feedback[ex.id].athleteNotes || undefined,
        })),
      });

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Fehler beim Abschließen der Runde");
      setLoading(false);
    }
  };

  // Wait for feedback state to be initialized
  const isReady = exercises.length > 0 && exercises.every((ex) => feedback[ex.id]);

  if (!isReady) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-emerald-400 mb-2">
          {isFinalRound ? "Session abschließen" : "Runde abschließen"}
        </h3>
        <p className="text-sm text-gray-400">
          Bitte gib für jede Übung Feedback zur Schwierigkeit und eventuellen
          Schmerzen.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {exercises.map((ex) => (
        <div
          key={ex.id}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-5"
        >
          <h4 className="font-medium mb-4">{ex.exercise.name}</h4>

          {/* Difficulty - MANDATORY */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Schwierigkeit: <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "TOO_EASY", label: "Zu leicht 😴", color: "blue" },
                {
                  value: "JUST_RIGHT",
                  label: "Genau richtig 💪",
                  color: "emerald",
                },
                { value: "TOO_HARD", label: "Zu schwer 😰", color: "red" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updateFeedback(
                      ex.id,
                      "difficulty",
                      option.value as ExerciseDifficulty,
                    )
                  }
                  className={`min-h-[44px] px-3 py-2 border rounded-lg font-medium text-sm transition-all ${
                    feedback[ex.id].difficulty === option.value
                      ? `bg-${option.color}-500/20 border-${option.color}-500 text-${option.color}-400`
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pain - Optional but must select regions if "Yes" */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Hattest du Schmerzen?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateFeedback(ex.id, "hadPain", false)}
                className={`min-h-[44px] px-4 py-2 border rounded-lg font-medium transition-all ${
                  !feedback[ex.id].hadPain
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                Nein
              </button>
              <button
                type="button"
                onClick={() => updateFeedback(ex.id, "hadPain", true)}
                className={`min-h-[44px] px-4 py-2 border rounded-lg font-medium transition-all ${
                  feedback[ex.id].hadPain
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                Ja
              </button>
            </div>
          </div>

          {/* Body Region Selector (only if had pain) */}
          {feedback[ex.id].hadPain && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Wo hattest du Schmerzen? <span className="text-red-400">*</span>
              </label>
              <BodyRegionSelector
                value={feedback[ex.id].painRegions}
                onChange={(regions) =>
                  updateFeedback(ex.id, "painRegions", regions)
                }
              />
            </div>
          )}

          {/* Optional notes */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Optionale Notizen
            </label>
            <textarea
              value={feedback[ex.id].athleteNotes}
              onChange={(e) =>
                updateFeedback(ex.id, "athleteNotes", e.target.value)
              }
              placeholder="z.B. Übung war etwas ungewohnt..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{isFinalRound ? "Schließe Session ab..." : "Schließe Runde ab..."}</span>
          </>
        ) : (
          isFinalRound ? "Session abschließen" : "Runde abschließen"
        )}
      </button>
    </form>
  );
}
