"use client";

import { startTrainingSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SessionStartButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionId = await startTrainingSession();
      router.push(`/dashboard/session/${sessionId}`);
    } catch (err: any) {
      setError(err.message || "Fehler beim Starten der Session");
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
      <h3 className="font-semibold mb-4">Training Session</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full min-h-[44px] bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Starte Session...</span>
          </>
        ) : (
          <>
            <span>🏋️</span>
            <span>Training Session starten</span>
          </>
        )}
      </button>
    </div>
  );
}
