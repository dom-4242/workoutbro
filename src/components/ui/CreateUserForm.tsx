"use client";

import { useState } from "react";
import { createUser } from "@/lib/actions/admin";

export default function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await createUser(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message ?? "Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 mb-6">
      <h3 className="font-semibold mb-4">Neuer Benutzer</h3>

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
          ✓ Benutzer erfolgreich erstellt!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
              placeholder="Max Mustermann"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">E-Mail</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
              placeholder="max@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Passwort</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>

        {/* Roles — checkboxes */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Rollen</label>
          <div className="flex flex-wrap gap-3">
            {["ATHLETE", "TRAINER", "ADMIN"].map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 cursor-pointer min-h-[44px] px-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-emerald-500 transition-colors"
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={role}
                  className="accent-emerald-500"
                />
                <span className="text-sm font-mono">{role}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-black font-semibold rounded-lg transition-colors min-h-[44px]"
        >
          {loading ? "..." : "Benutzer erstellen"}
        </button>

      </form>
    </div>
  );
}