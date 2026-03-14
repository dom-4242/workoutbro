"use client";

import { useState } from "react";
import { changePassword } from "@/lib/actions/profile";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setErrorMessage("New passwords do not match");
      return;
    }

    const result = await changePassword(currentPassword, newPassword);

    if (result.success) {
      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Aktuelles Passwort
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 min-h-[44px]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Neues Passwort
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 min-h-[44px]"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Neues Passwort bestätigen
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 min-h-[44px]"
        />
      </div>

      {status === "error" && (
        <p className="text-red-400 text-sm">{errorMessage}</p>
      )}

      {status === "success" && (
        <p className="text-emerald-400 text-sm">Passwort erfolgreich geändert</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2 min-h-[44px] transition-colors"
      >
        {status === "loading" ? "Wird gespeichert..." : "Passwort ändern"}
      </button>
    </form>
  );
}
