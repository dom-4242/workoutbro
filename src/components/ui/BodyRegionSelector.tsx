"use client";

import { useState } from "react";
import { BodyRegion } from "@prisma/client";

type Props = {
  value: BodyRegion[];
  onChange: (regions: BodyRegion[]) => void;
};

// Region labels for display
const regionLabels: Record<BodyRegion, string> = {
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

export default function BodyRegionSelector({ value, onChange }: Props) {
  const toggleRegion = (region: BodyRegion) => {
    const newValue = value.includes(region)
      ? value.filter((r) => r !== region)
      : [...value, region];
    onChange(newValue);
  };

  const isSelected = (region: BodyRegion) => value.includes(region);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Front view */}
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Vorderseite</h4>
          <svg viewBox="0 0 200 400" className="w-full max-w-[200px] mx-auto">
            {/* Head */}
            <ellipse
              cx="100"
              cy="30"
              rx="25"
              ry="30"
              fill="#374151"
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Neck/Shoulders */}
            <path
              d="M 50 55 L 75 60 L 75 80 L 125 80 L 125 60 L 150 55 L 150 75 L 125 80 L 75 80 L 50 75 Z"
              fill={isSelected("NECK_SHOULDERS") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("NECK_SHOULDERS")}
            />
            <text
              x="100"
              y="73"
              textAnchor="middle"
              fontSize="8"
              fill="#D1D5DB"
              className="pointer-events-none select-none"
            >
              Nacken/Schultern
            </text>

            {/* Chest */}
            <rect
              x="70"
              y="80"
              width="60"
              height="50"
              fill={isSelected("CHEST") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("CHEST")}
            />

            {/* Abs */}
            <rect
              x="75"
              y="130"
              width="50"
              height="40"
              fill={isSelected("ABS") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("ABS")}
            />

            {/* Left Arm */}
            <rect
              x="35"
              y="80"
              width="30"
              height="100"
              rx="15"
              fill={isSelected("LEFT_ARM") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("LEFT_ARM")}
            />

            {/* Right Arm */}
            <rect
              x="135"
              y="80"
              width="30"
              height="100"
              rx="15"
              fill={isSelected("RIGHT_ARM") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("RIGHT_ARM")}
            />

            {/* Left Thigh Front */}
            <rect
              x="70"
              y="170"
              width="25"
              height="80"
              rx="10"
              fill={isSelected("LEFT_THIGH_FRONT") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("LEFT_THIGH_FRONT")}
            />

            {/* Right Thigh Front */}
            <rect
              x="105"
              y="170"
              width="25"
              height="80"
              rx="10"
              fill={isSelected("RIGHT_THIGH_FRONT") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("RIGHT_THIGH_FRONT")}
            />

            {/* Left Knee */}
            <circle
              cx="82.5"
              cy="260"
              r="12"
              fill={isSelected("LEFT_KNEE") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("LEFT_KNEE")}
            />

            {/* Right Knee */}
            <circle
              cx="117.5"
              cy="260"
              r="12"
              fill={isSelected("RIGHT_KNEE") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("RIGHT_KNEE")}
            />

            {/* Left Calf */}
            <rect
              x="72"
              y="275"
              width="20"
              height="70"
              rx="10"
              fill={isSelected("LEFT_CALF") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("LEFT_CALF")}
            />

            {/* Right Calf */}
            <rect
              x="108"
              y="275"
              width="20"
              height="70"
              rx="10"
              fill={isSelected("RIGHT_CALF") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("RIGHT_CALF")}
            />
          </svg>
        </div>

        {/* Back view */}
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Rückseite</h4>
          <svg viewBox="0 0 200 400" className="w-full max-w-[200px] mx-auto">
            {/* Head (back) */}
            <ellipse
              cx="100"
              cy="30"
              rx="25"
              ry="30"
              fill="#374151"
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Upper Back */}
            <rect
              x="70"
              y="60"
              width="60"
              height="50"
              fill={isSelected("UPPER_BACK") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("UPPER_BACK")}
            />

            {/* Lower Back */}
            <rect
              x="75"
              y="110"
              width="50"
              height="60"
              fill={isSelected("LOWER_BACK") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("LOWER_BACK")}
            />

            {/* Left Thigh Back */}
            <rect
              x="70"
              y="170"
              width="25"
              height="80"
              rx="10"
              fill={isSelected("LEFT_THIGH_BACK") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("LEFT_THIGH_BACK")}
            />

            {/* Right Thigh Back */}
            <rect
              x="105"
              y="170"
              width="25"
              height="80"
              rx="10"
              fill={isSelected("RIGHT_THIGH_BACK") ? "#EF4444" : "#4B5563"}
              stroke="#9CA3AF"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleRegion("RIGHT_THIGH_BACK")}
            />
          </svg>
        </div>
      </div>

      {/* Selected regions list */}
      {value.length > 0 && (
        <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <p className="text-sm font-medium mb-2 text-gray-300">Ausgewählte Bereiche:</p>
          <div className="flex flex-wrap gap-2">
            {value.map((region) => (
              <span
                key={region}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400"
              >
                {regionLabels[region]}
                <button
                  onClick={() => toggleRegion(region)}
                  className="hover:text-red-300 ml-1 text-base leading-none"
                  aria-label="Entfernen"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
