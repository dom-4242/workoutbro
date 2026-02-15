"use client";

import { useState } from "react";
import { assignTrainer } from "@/lib/actions/admin";

type Trainer = {
  id: string;
  name: string;
};

type Props = {
  athleteId: string;
  currentTrainerId: string | null;
  trainers: Trainer[];
};

export default function AssignTrainerSelect({
  athleteId,
  currentTrainerId,
  trainers,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    const value = e.target.value;
    try {
      await assignTrainer(athleteId, value === "none" ? null : value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      onChange={handleChange}
      defaultValue={currentTrainerId ?? "none"}
      disabled={loading}
      className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white focus:outline-none focus:border-emerald-500 transition-colors min-h-[36px] disabled:opacity-50"
    >
      <option value="none">Kein Trainer</option>
      {trainers.map((trainer) => (
        <option key={trainer.id} value={trainer.id}>
          {trainer.name}
        </option>
      ))}
    </select>
  );
}
