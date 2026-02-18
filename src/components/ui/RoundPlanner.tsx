"use client";

import { useState } from "react";
import { saveRound, releaseRound, deleteRound } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import { ExerciseField } from "@prisma/client";

type Exercise = {
  id: string;
  name: string;
  requiredFields: ExerciseField[];
};

type RoundExercise = {
  exerciseId: string;
  order: number;
  plannedWeight?: number;
  plannedReps?: number;
  plannedDistance?: number;
  plannedTime?: number;
  plannedRPE?: number;
  trainerNotes?: string;
};

type Round = {
  id: string;
  roundNumber: number;
  status: string;
  isFinalRound: boolean;
  exercises: Array<{
    id: string;
    order: number;
    plannedWeight?: number | null;
    plannedReps?: number | null;
    plannedDistance?: number | null;
    plannedTime?: number | null;
    plannedRPE?: number | null;
    trainerNotes?: string | null;
    exerciseId: string;
  }>;
};

type Props = {
  sessionId: string;
  availableExercises: Exercise[];
  round?: Round | null;
  onRoundCreated?: (roundId: string) => void;
  onRoundDeleted?: () => void;
};

export default function RoundPlanner({
  sessionId,
  availableExercises,
  round,
  onRoundCreated,
  onRoundDeleted,
}: Props) {
  const router = useRouter();
  const [exercises, setExercises] = useState<RoundExercise[]>(
    round
      ? round.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          plannedWeight: ex.plannedWeight ?? undefined,
          plannedReps: ex.plannedReps ?? undefined,
          plannedDistance: ex.plannedDistance ?? undefined,
          plannedTime: ex.plannedTime ?? undefined,
          plannedRPE: ex.plannedRPE ?? undefined,
          trainerNotes: ex.trainerNotes ?? undefined,
        }))
      : [],
  );

  const [isFinalRound, setIsFinalRound] = useState(round?.isFinalRound ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseId: availableExercises[0]?.id || "",
        order: exercises.length + 1,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    // Re-order
    setExercises(newExercises.map((ex, i) => ({ ...ex, order: i + 1 })));
  };

  const updateExercise = (
    index: number,
    field: keyof RoundExercise,
    value: any,
  ) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const getSelectedExercise = (exerciseId: string) => {
    return availableExercises.find((ex) => ex.id === exerciseId);
  };

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      const roundId = await saveRound({
        sessionId,
        roundId: round?.id,
        isFinalRound,
        exercises,
      });

      router.refresh();

      // If this was a new round, notify parent to select it
      if (!round?.id && onRoundCreated) {
        onRoundCreated(roundId);
      }
    } catch (err: any) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!round?.id) return;

    setError(null);
    setLoading(true);

    try {
      // First save (with isFinalRound)
      await saveRound({
        sessionId,
        roundId: round.id,
        isFinalRound,
        exercises,
      });

      // Then release
      await releaseRound(round.id);

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Fehler beim Freigeben");
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!round?.id) return;

    setError(null);
    setLoading(true);

    try {
      await deleteRound(round.id);
      router.refresh();
      onRoundDeleted?.();
    } catch (err: any) {
      setError(err.message || "Fehler beim Löschen");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 className="font-semibold text-lg mb-4">
        {round
          ? `Runde ${round.roundNumber} ${round.status === "DRAFT" ? "bearbeiten" : "anzeigen"}`
          : "Neue Runde erstellen"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Noch keine Übungen hinzugefügt
          </div>
        ) : (
          exercises.map((ex, idx) => {
            const selectedExercise = getSelectedExercise(ex.exerciseId);
            return (
              <div
                key={idx}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    Übung {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExercise(idx)}
                    disabled={round?.status !== "DRAFT" && !!round}
                    className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed text-sm"
                  >
                    Entfernen
                  </button>
                </div>

                {/* Exercise Selector */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Übung
                  </label>
                  <select
                    value={ex.exerciseId}
                    onChange={(e) =>
                      updateExercise(idx, "exerciseId", e.target.value)
                    }
                    disabled={round?.status !== "DRAFT" && !!round}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800 disabled:text-gray-500"
                  >
                    {availableExercises.map((ae) => (
                      <option key={ae.id} value={ae.id}>
                        {ae.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Fields */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {selectedExercise?.requiredFields.includes("WEIGHT") && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        Gewicht (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={ex.plannedWeight ?? ""}
                        onChange={(e) =>
                          updateExercise(
                            idx,
                            "plannedWeight",
                            parseFloat(e.target.value) || undefined,
                          )
                        }
                        disabled={round?.status !== "DRAFT" && !!round}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>
                  )}

                  {selectedExercise?.requiredFields.includes("REPS") && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        Wiederholungen
                      </label>
                      <input
                        type="number"
                        value={ex.plannedReps ?? ""}
                        onChange={(e) =>
                          updateExercise(
                            idx,
                            "plannedReps",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        disabled={round?.status !== "DRAFT" && !!round}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>
                  )}

                  {selectedExercise?.requiredFields.includes("DISTANCE") && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        Distanz (m)
                      </label>
                      <input
                        type="number"
                        value={ex.plannedDistance ?? ""}
                        onChange={(e) =>
                          updateExercise(
                            idx,
                            "plannedDistance",
                            parseFloat(e.target.value) || undefined,
                          )
                        }
                        disabled={round?.status !== "DRAFT" && !!round}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>
                  )}

                  {selectedExercise?.requiredFields.includes("TIME") && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        Zeit (sek)
                      </label>
                      <input
                        type="number"
                        value={ex.plannedTime ?? ""}
                        onChange={(e) =>
                          updateExercise(
                            idx,
                            "plannedTime",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        disabled={round?.status !== "DRAFT" && !!round}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>
                  )}

                  {selectedExercise?.requiredFields.includes("RPE") && (
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        RPE (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ex.plannedRPE ?? ""}
                        onChange={(e) =>
                          updateExercise(
                            idx,
                            "plannedRPE",
                            parseInt(e.target.value) || undefined,
                          )
                        }
                        disabled={round?.status !== "DRAFT" && !!round}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>
                  )}
                </div>

                {/* Trainer Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Notizen (optional)
                  </label>
                  <textarea
                    value={ex.trainerNotes ?? ""}
                    onChange={(e) =>
                      updateExercise(idx, "trainerNotes", e.target.value)
                    }
                    disabled={round?.status !== "DRAFT" && !!round}
                    placeholder="z.B. Achte auf die Form..."
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 disabled:bg-gray-800 disabled:text-gray-500"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Exercise Button */}
      {(!round || round.status === "DRAFT") && (
        <button
          type="button"
          onClick={addExercise}
          disabled={loading}
          className="w-full min-h-[44px] mb-4 bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium rounded-lg transition-colors"
        >
          + Übung hinzufügen
        </button>
      )}

      {/* Final Round Checkbox */}
      {(!round || round.status === "DRAFT") && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isFinalRound}
            onChange={(e) => setIsFinalRound(e.target.checked)}
            disabled={loading}
            className="w-4 h-4 accent-emerald-500 rounded"
          />
          <span className="text-sm text-gray-400">
            Dies ist die letzte Runde der Session
          </span>
        </label>
      )}

      {/* Action Buttons */}
      {(!round || round.status === "DRAFT") && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || exercises.length === 0}
            className="flex-1 min-h-[44px] bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Speichern..." : round ? "Änderungen speichern" : "Speichern"}
          </button>

          {round && (
            <button
              type="button"
              onClick={handleRelease}
              disabled={loading || exercises.length === 0}
              className="flex-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Freigeben..." : "Runde freigeben"}
            </button>
          )}
        </div>
      )}

      {/* Delete Button (only for DRAFT rounds) */}
      {round && round.status === "DRAFT" && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          {showDeleteConfirm ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400 mb-3">
                Runde wirklich löschen? Dies kann nicht rückgängig gemacht
                werden.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 min-h-[44px] bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "Löschen..." : "Ja, löschen"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 min-h-[44px] bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium rounded-lg transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="w-full min-h-[44px] text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 disabled:text-gray-600 disabled:border-gray-700 font-medium rounded-lg transition-colors text-sm"
            >
              Runde löschen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
