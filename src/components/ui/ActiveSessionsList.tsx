"use client";

import { joinTrainingSession } from "@/lib/actions/session";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
  id: string;
  status: string;
  startedAt: Date;
  athlete: {
    name: string;
  };
};

type Props = {
  waitingSessions: Session[];
  activeSessions: Session[];
};

export default function ActiveSessionsList({
  waitingSessions,
  activeSessions,
}: Props) {
  const router = useRouter();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (sessionId: string) => {
    setJoiningId(sessionId);
    setError(null);

    try {
      await joinTrainingSession(sessionId);
      router.push(`/dashboard/session/${sessionId}/trainer`);
    } catch (err: any) {
      setError(err.message || "Fehler beim Beitreten");
      setJoiningId(null);
    }
  };

  if (waitingSessions.length === 0 && activeSessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 mb-6 md:mb-8">
      <h3 className="font-semibold mb-4">Aktive Sessions</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Waiting Sessions */}
      {waitingSessions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">Warten auf dich:</h4>
          <div className="space-y-2">
            {waitingSessions.map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{session.athlete.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.startedAt).toLocaleString("de-CH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-medium">
                  WAITING
                </span>
                <button
                  onClick={() => handleJoin(session.id)}
                  disabled={joiningId === session.id}
                  className="min-h-[36px] px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {joiningId === session.id ? "..." : "Beitreten"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h4 className="text-sm text-gray-400 mb-2">Läuft gerade:</h4>
          <div className="space-y-1">
            {activeSessions.map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/session/${session.id}/trainer`}
                className="flex justify-between items-center min-h-[44px] py-2 px-3 border-b border-gray-800 last:border-0 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{session.athlete.name}</p>
                  <p className="text-xs text-gray-400">
                    Session läuft seit{" "}
                    {new Date(session.startedAt).toLocaleString("de-CH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-gray-400 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
