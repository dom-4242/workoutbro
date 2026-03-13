import { ExerciseCategory } from "@prisma/client";

export const categoryLabels: Record<ExerciseCategory, string> = {
  CHEST: "Brust",
  BACK: "Rücken",
  SHOULDERS: "Schultern",
  LEGS: "Beine",
  ARMS: "Arme",
  CORE: "Core",
  CARDIO: "Cardio",
  CUSTOM: "Eigene Kategorie",
};
