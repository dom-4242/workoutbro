"use client";

import { BodyRegion } from "@prisma/client";
import { CR10_LABELS, getCR10Style } from "@/lib/cr10";

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

type Props = {
  exercises: Exercise[];
};

const regionLabels: Record<BodyRegion, string> = {
  NECK_SHOULDERS: "Nacken/Schultern",
  CHEST: "Brust",
  UPPER_BACK: "Oberer Rücken",
  LOWER_BACK: "Unterer Rücken",
  ABS: "Bauch",
  LEFT_ARM: "Linker Arm",
  RIGHT_ARM: "Rechter Arm",
  LEFT_THIGH_FRONT: "Linker Oberschenkel vorne",
  LEFT_THIGH_BACK: "Linker Oberschenkel hinten",
  RIGHT_THIGH_FRONT: "Rechter Oberschenkel vorne",
  RIGHT_THIGH_BACK: "Rechter Oberschenkel hinten",
  LEFT_CALF: "Linke Wade",
  RIGHT_CALF: "Rechte Wade",
  LEFT_KNEE: "Linkes Knie",
  RIGHT_KNEE: "Rechtes Knie",
};

export default function FeedbackSummary({ exercises }: Props) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-300 mb-2">
        Athleten-Feedback:
      </h4>

      {exercises.map((ex) => (
        <div
          key={ex.id}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
        >
          <p className="font-medium mb-2 text-sm">{ex.exercise.name}</p>

          <div className="flex flex-wrap gap-2">
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
                ⚠️ Schmerzen: {ex.painRegions.map((r) => regionLabels[r]).join(", ")}
              </span>
            )}
          </div>

          {/* Athlete Notes */}
          {ex.athleteNotes && (
            <p className="text-sm text-gray-400 mt-2 italic">
              "{ex.athleteNotes}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
