"use client";

import { useState, useEffect } from "react";
import { createExercise, updateExercise } from "@/lib/actions/exercise";
import { Exercise, ExerciseCategory, ExerciseField } from "@prisma/client";

interface ExerciseFormProps {
  exercise?: Exercise; // If provided, we're editing
  onClose: () => void;
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

const fieldOptions: { value: ExerciseField; label: string }[] = [
  { value: "WEIGHT", label: "Gewicht (kg)" },
  { value: "REPS", label: "Wiederholungen" },
  { value: "DISTANCE", label: "Distanz (m)" },
  { value: "TIME", label: "Zeit (s)" },
  { value: "RPE", label: "RPE (1-10)" },
  { value: "NOTES", label: "Notizen" },
];

export default function ExerciseForm({ exercise, onClose }: ExerciseFormProps) {
  const isEdit = !!exercise;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<ExerciseCategory>(
    exercise?.category ?? "CHEST",
  );
  const [selectedFields, setSelectedFields] = useState<ExerciseField[]>(
    exercise?.requiredFields ?? [],
  );
  const [videoPreview, setVideoPreview] = useState<string | null>(
    exercise?.videoPath ?? null,
  );

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  function handleFieldToggle(field: ExerciseField) {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setVideoPreview(null);
      return;
    }

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError("Video muss kleiner als 50MB sein");
      e.target.value = "";
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      if (isEdit && exercise) {
        await updateExercise(exercise.id, formData);
      } else {
        await createExercise(formData);
      }

      onClose();
    } catch (err: any) {
      setError(err.message ?? "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEdit ? "Übung bearbeiten" : "Neue Übung"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={exercise?.name}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
              placeholder="z.B. Bench Press"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Kategorie <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Category (conditional) */}
          {category === "CUSTOM" && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Eigene Kategorie <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="customCategory"
                required
                defaultValue={exercise?.customCategory ?? ""}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
                placeholder="z.B. Functional Training"
              />
            </div>
          )}

          {/* Required Fields */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Pflichtfelder <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fieldOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer min-h-[44px] px-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-emerald-500 transition-colors"
                >
                  <input
                    type="checkbox"
                    name="requiredFields"
                    value={value}
                    checked={selectedFields.includes(value)}
                    onChange={() => handleFieldToggle(value)}
                    className="accent-emerald-500"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
            {selectedFields.length === 0 && (
              <p className="text-xs text-red-400 mt-1">
                Mindestens ein Feld muss ausgewählt werden
              </p>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Video (optional, max 50MB)
            </label>
            <input
              type="file"
              name="video"
              accept="video/mp4,video/webm"
              onChange={handleVideoChange}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-black hover:file:bg-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
            />
            {videoPreview && (
              <div className="mt-3 bg-gray-950 rounded-lg overflow-hidden">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors min-h-[44px]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || selectedFields.length === 0}
              className="flex-1 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-semibold rounded-lg transition-colors min-h-[44px]"
            >
              {loading ? "..." : isEdit ? "Speichern" : "Erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
