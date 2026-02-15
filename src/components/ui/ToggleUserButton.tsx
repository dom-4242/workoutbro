"use client";

import { useState } from "react";
import { toggleUserActive } from "@/lib/actions/admin";

type Props = {
  userId: string;
  isActive: boolean;
};

export default function ToggleUserButton({ userId, isActive }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await toggleUserActive(userId, isActive);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors min-h-[36px] ${
        isActive
          ? "text-red-400 border-red-400/30 bg-red-400/10 hover:bg-red-400/20"
          : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10 hover:bg-emerald-400/20"
      }`}
    >
      {loading ? "..." : isActive ? "Deaktivieren" : "Aktivieren"}
    </button>
  );
}