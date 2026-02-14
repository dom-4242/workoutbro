"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WeightEntry = {
  date: Date;
  weight: number;
};

type Props = {
  entries: WeightEntry[];
};

// Custom Tooltip styling
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-emerald-400 font-semibold">
          {payload[0].value} kg
        </p>
      </div>
    );
  }
  return null;
}

export default function WeightChart({ entries }: Props) {
  // Prepare data for chart — oldest first
  const data = [...entries]
    .reverse()
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("de-CH", {
        day: "2-digit",
        month: "2-digit",
      }),
      weight: entry.weight,
    }));

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
        Mindestens 2 Einträge für den Chart benötigt.
      </div>
    );
  }

  // Calculate Y-axis domain with padding
  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d31" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#7a7f8a", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#2a2d31" }}
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fill: "#7a7f8a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#00e5a0"
          strokeWidth={2}
          dot={{ fill: "#00e5a0", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#00e5a0" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}