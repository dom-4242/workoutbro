import { BodyRegion } from "@prisma/client";

/**
 * Human-readable German labels for all 15 body regions.
 * Single source of truth — used in BodyRegionSelector and CompletedRoundsHistory.
 */
export const regionLabels: Record<BodyRegion, string> = {
  NECK_SHOULDERS: "Nacken & Schultern",
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
