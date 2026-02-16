"use client";

import { useState } from "react";
import { Exercise, ExerciseCategory, User } from "@prisma/client";
import ExerciseCard from "@/components/ui/ExerciseCard";
import ExerciseForm from "@/components/ui/ExerciseForm";

type ExerciseWithCreator = Exercise & { creator: User };

interface ExercisesClientProps {
  exercises: ExerciseWithCreator[];
}

const categoryLabels: Record<ExerciseCategory, string> = {
  CHEST: "Brust",
  BACK: "Rücken",
  SHOULDERS: "Schultern",
  LEGS: "Beine",
  ARMS: "Arme",
  CORE: "Core",
  CARDIO: "Cardio",
  CUSTOM: "Eigene Kategorie",
};

export default function ExercisesClient({
  exercises,
}: ExercisesClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingExercise(null);
  }

  // Group exercises by category
  const groupedExercises = exercises.reduce(
    (acc, exercise) => {
      const category = exercise.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(exercise);
      return acc;
    },
    {} as Record<ExerciseCategory, ExerciseWithCreator[]>,
  );

  // Order categories (alphabetically, but with CUSTOM last)
  const sortedCategories = Object.keys(groupedExercises).sort((a, b) => {
    if (a === "CUSTOM") return 1;
    if (b === "CUSTOM") return -1;
    return categoryLabels[a as ExerciseCategory].localeCompare(
      categoryLabels[b as ExerciseCategory],
    );
  }) as ExerciseCategory[];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Übungsverwaltung</h2>
        <button
          onClick={() => {
            setEditingExercise(null);
            setShowForm(true);
          }}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors min-h-[44px]"
        >
          + Neue Übung
        </button>
      </div>

      {/* Empty State */}
      {exercises.length === 0 && (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-gray-500 mb-4">Noch keine Übungen vorhanden</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors min-h-[44px]"
          >
            + Erste Übung erstellen
          </button>
        </div>
      )}

      {/* Exercises grouped by category */}
      {sortedCategories.map((category) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">
            {categoryLabels[category]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedExercises[category].map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Modal Form */}
      {showForm && (
        <ExerciseForm
          exercise={editingExercise ?? undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
