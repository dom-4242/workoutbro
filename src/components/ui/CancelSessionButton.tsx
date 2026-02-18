"use client";

import { useState } from "react";
import { cancelSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";

type Props = {
  sessionId: string;
};

export default function CancelSessionButton({ sessionId }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setError(null);
    setLoading(true);

    try {
      await cancelSession(sessionId);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Fehler beim Abbrechen");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-sm text-red-400 mb-3">
          Session wirklich abbrechen? Dies kann nicht rückgängig gemacht werden.
        </p>
        {error && (
          <p className="text-sm text-red-400 mb-3">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 min-h-[44px] bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? "Abbrechen..." : "Ja, Session abbrechen"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 min-h-[44px] bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="min-h-[44px] px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 font-medium rounded-lg transition-colors text-sm"
    >
      Session abbrechen
    </button>
  );
}
