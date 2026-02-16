"use client";

import { useState } from "react";
import { deleteExercise } from "@/lib/actions/exercise";
import { Exercise, ExerciseField } from "@prisma/client";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
}

// Map field enums to German labels
const fieldLabels: Record<ExerciseField, string> = {
  WEIGHT: "Gewicht",
  REPS: "Wiederholungen",
  DISTANCE: "Distanz",
  TIME: "Zeit",
  RPE: "RPE",
  NOTES: "Notizen",
};

export default function ExerciseCard({ exercise, onEdit }: ExerciseCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Übung "${exercise.name}" wirklich löschen?`)) return;

    setDeleting(true);
    try {
      await deleteExercise(exercise.id);
    } catch (err: any) {
      alert(err.message ?? "Fehler beim Löschen");
      setDeleting(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all">
      {/* Video Preview */}
      {exercise.videoPath ? (
        <div className="relative bg-gray-950 aspect-video">
          <video
            src={exercise.videoPath}
            className="w-full h-full object-contain"
            loop
            muted
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        </div>
      ) : (
        <div className="bg-gray-950 aspect-video flex items-center justify-center">
          <p className="text-gray-600 text-sm">Kein Video</p>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{exercise.name}</h3>

        <p className="text-sm text-gray-400 mb-3">
          {exercise.category === "CUSTOM" && exercise.customCategory
            ? exercise.customCategory
            : exercise.category}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {exercise.requiredFields.map((field) => (
            <span
              key={field}
              className="text-xs font-mono px-2 py-0.5 rounded border text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
            >
              {fieldLabels[field]}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(exercise)}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
          >
            Bearbeiten
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors min-h-[44px] disabled:opacity-50"
          >
            {deleting ? "..." : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
