/**
 * Borg CR-10 Scale utilities
 * Scale: 0 (nothing) – 10 (absolute maximum)
 */

export const CR10_LABELS: Record<number, string> = {
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

/** Returns a hex color for the CR-10 value (used for slider track & value display) */
export function getCR10Color(value: number): string {
  if (value <= 2) return "#60a5fa"; // blue
  if (value <= 4) return "#34d399"; // emerald
  if (value <= 6) return "#fbbf24"; // amber
  if (value <= 8) return "#f97316"; // orange
  return "#ef4444"; // red
}

/** Returns the CSS linear-gradient for the slider track */
export function getCR10TrackStyle(value: number): string {
  const color = getCR10Color(value);
  const pct = (value / 10) * 100;
  return `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #374151 ${pct}%, #374151 100%)`;
}

/** Returns Tailwind badge classes for the CR-10 value (used in summary/history) */
export function getCR10Style(rpe: number): string {
  if (rpe <= 2) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (rpe <= 4) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (rpe <= 6) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (rpe <= 8) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}
