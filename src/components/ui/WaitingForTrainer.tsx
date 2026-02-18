"use client";

import { useRouter } from "next/navigation";

export default function WaitingForTrainer() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="mb-6">
        <div className="inline-block w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Warte auf Trainer...</h2>
      <p className="text-gray-400 mb-6">
        Dein Trainer wurde benachrichtigt und wird bald beitreten.
      </p>

      <button
        onClick={handleRefresh}
        className="min-h-[44px] px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
      >
        Aktualisieren
      </button>
    </div>
  );
}
