"use client";

import { useFormStatus } from "react-dom";
import { setLocale } from "@/lib/actions/profile";

const LANGUAGES = [
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "en", label: "EN", name: "English" },
] as const;

function LocaleButton({
  code,
  label,
  name,
  isActive,
}: {
  code: string;
  label: string;
  name: string;
  isActive: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="locale"
      value={code}
      disabled={pending || isActive}
      aria-pressed={isActive}
      title={name}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[44px] min-w-[60px] ${
        isActive
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-default"
          : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600 disabled:opacity-50"
      }`}
    >
      {label}
    </button>
  );
}

interface LanguageSelectorProps {
  currentLocale: string;
}

export default function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  return (
    <form action={setLocale} className="flex gap-2">
      {LANGUAGES.map(({ code, label, name }) => (
        <LocaleButton
          key={code}
          code={code}
          label={label}
          name={name}
          isActive={currentLocale === code}
        />
      ))}
    </form>
  );
}
