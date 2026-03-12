"use client";

import { useState, useEffect } from "react";
import { BodyRegion } from "@prisma/client";
import BodyRegionSelector from "./BodyRegionSelector";
import { completeRound } from "@/lib/actions/session";
import { useRouter } from "next/navigation";

// Borg CR-10 scale labels and colors
const CR10_LABELS: Record<number, string> = {
  0: "Gar nichts",
  1: "Sehr schwach",
  2: "Schwach",
  3: "Moderat",
  4: "Etwas schwer",
  5: "Schwer",
  6: "Schwer",
  7: "Sehr schwer",
  8: "Sehr schwer",
  9: "Extrem schwer",
  10: "Absolutes Maximum",
};

function getCR10Color(value: number): string {
  if (value <= 2) return "#60a5fa"; // blue
  if (value <= 4) return "#34d399"; // emerald
  if (value <= 6) return "#fbbf24"; // amber
  if (value <= 8) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getCR10TrackStyle(value: number): string {
  const color = getCR10Color(value);
  const pct = (value / 10) * 100;
  return `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #374151 ${pct}%, #374151 100%)`;
}

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
  rpe: number | null;
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
            rpe: null,
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

    // Validate: all exercises must have rpe set
    const missingRpe = exercises.filter(
      (ex) => feedback[ex.id]?.rpe === null || feedback[ex.id]?.rpe === undefined,
    );
    if (missingRpe.length > 0) {
      setError("Bitte bewerte die Anstrengung (CR-10) für alle Übungen");
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
          rpe: feedback[ex.id].rpe!,
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
          Bitte bewerte für jede Übung die empfundene Anstrengung (Borg CR-10) und
          allfällige Schmerzen.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {exercises.map((ex) => {
        const currentRpe = feedback[ex.id]?.rpe;
        const hasRpe = currentRpe !== null && currentRpe !== undefined;
        const color = hasRpe ? getCR10Color(currentRpe) : "#6b7280";

        return (
          <div
            key={ex.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 md:p-5"
          >
            <h4 className="font-medium mb-5">{ex.exercise.name}</h4>

            {/* CR-10 Slider — MANDATORY */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Empfundene Anstrengung (CR-10):{" "}
                <span className="text-red-400">*</span>
              </label>

              {/* Value display */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 flex-shrink-0 transition-all duration-200"
                  style={{
                    borderColor: color,
                    color: color,
                    backgroundColor: `${color}18`,
                  }}
                >
                  {hasRpe ? currentRpe : "—"}
                </div>
                <div>
                  <div
                    className="text-lg font-semibold transition-all duration-200"
                    style={{ color: hasRpe ? color : "#6b7280" }}
                  >
                    {hasRpe ? CR10_LABELS[currentRpe] : "Noch nicht bewertet"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    0 = Gar nichts · 10 = Absolutes Maximum
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="relative px-1">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={hasRpe ? currentRpe : 5}
                  onChange={(e) =>
                    updateFeedback(ex.id, "rpe", parseInt(e.target.value))
                  }
                  onTouchStart={() => {
                    if (!hasRpe) updateFeedback(ex.id, "rpe", 5);
                  }}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: hasRpe
                      ? getCR10TrackStyle(currentRpe)
                      : "#374151",
                    // Thumb styles via CSS custom props
                    ["--thumb-color" as any]: color,
                  }}
                />
                {/* Scale labels */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
              </div>

              {/* First-touch hint */}
              {!hasRpe && (
                <p className="text-xs text-amber-400/80 mt-2 text-center">
                  ☝️ Schieberegler berühren um zu bewerten
                </p>
              )}
            </div>

            {/* Pain - Optional */}
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

            {/* Body Region Selector */}
            {feedback[ex.id].hadPain && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Wo hattest du Schmerzen?{" "}
                  <span className="text-red-400">*</span>
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
        );
      })}

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>
              {isFinalRound ? "Schließe Session ab..." : "Schließe Runde ab..."}
            </span>
          </>
        ) : isFinalRound ? (
          "Session abschließen"
        ) : (
          "Runde abschließen"
        )}
      </button>
    </form>
  );
}
