import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import ChangePasswordForm from "@/components/ui/ChangePasswordForm";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const t = await getTranslations("settings");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { locale: true },
  });
  const currentLocale = dbUser?.locale ?? "de";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white text-sm transition-colors min-h-[44px] flex items-center"
        >
          ← Dashboard
        </Link>
        <h1 className="text-lg font-bold">{t("title")}</h1>
        <div className="w-20" />
      </header>

      <div className="max-w-lg mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Language */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
          <h2 className="font-semibold mb-4">{t("language")}</h2>
          <LanguageSelector currentLocale={currentLocale} />
        </div>

        {/* Change Password */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
          <h2 className="font-semibold mb-4">{t("password")}</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
