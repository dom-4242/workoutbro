"use client";

import { useState } from "react";
import { addWeightEntry } from "@/lib/actions/weight";
import { useTranslations } from "next-intl";

export default function WeightForm() {
  const t = useTranslations("weight");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Default date to today
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await addWeightEntry(formData);
      setSuccess(true);
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError("Fehler beim Speichern. Bitte versuche es nochmals.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
      <h3 className="font-semibold mb-4">{t("addEntry")}</h3>

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
          ✓ Eintrag gespeichert!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Date and Weight side by side on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {t("date")}
            </label>
            <input
              type="date"
              name="date"
              defaultValue={today}
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {t("weight")}
            </label>
            <input
              type="number"
              name="weight"
              step="0.1"
              min="20"
              max="300"
              required
              placeholder="75.5"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            {t("note")}
          </label>
          <input
            type="text"
            name="note"
            placeholder="z.B. Nach dem Training"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-semibold rounded-lg transition-colors min-h-[44px]"
        >
          {loading ? "..." : t("saveEntry")}
        </button>

      </form>
    </div>
  );
}