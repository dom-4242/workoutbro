import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import WeightForm from "@/components/ui/WeightForm";
import WeightChart from "@/components/ui/WeightChart";
import LogoutButton from "@/components/ui/LogoutButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const t = await getTranslations("dashboard");

  const roles = ((session.user as any)?.roles as string[]) ?? [];
  const isTrainer = roles.includes("TRAINER");
  const isOnlyTrainer = isTrainer && !roles.includes("ATHLETE");

  const weightEntries = isOnlyTrainer
    ? []
    : await prisma.weightEntry.findMany({
        where: { userId: (session.user as any).id },
        orderBy: { date: "desc" },
        take: 7,
      });

  const latestWeight = weightEntries[0]?.weight ?? null;

  // Load athletes if user is a trainer
  const athletes = isTrainer
    ? await prisma.user.findMany({
        where: { trainerId: (session.user as any).id },
        include: { roles: true },
      })
    : [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold">WorkoutBro 💪</h1>
        <div className="flex items-center gap-3 md:gap-4">
          <span className="text-gray-400 text-sm hidden sm:block">
            {session.user?.name}
          </span>

          {/* Admin Link — nur für ADMIN sichtbar */}
          {roles.includes("ADMIN") && (
            <Link
              href="/admin/users"
              className="text-xs font-mono text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 rounded hover:bg-yellow-400/20 transition-colors min-h-[36px] flex items-center"
            >
              ADMIN
            </Link>
          )}

          <LogoutButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Welcome */}
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
          {t("welcome", { name: session.user?.name ?? "" })}
        </h2>

        {/* Athletes List — only for trainers */}
        {isTrainer && athletes.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 mb-6 md:mb-8">
            <h3 className="font-semibold mb-4">Meine Athleten</h3>
            <div className="space-y-1">
              {athletes.map((athlete) => (
                <Link
                  key={athlete.id}
                  href={`/dashboard/athlete/${athlete.id}`}
                  className="flex justify-between items-center min-h-[44px] py-2 px-3 border-b border-gray-800 last:border-0 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span className="font-medium text-sm">{athlete.name}</span>
                  <span className="text-gray-400 text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid — nur für Athleten */}
        {!isOnlyTrainer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
              <p className="text-gray-400 text-sm mb-1">{t("todayWeight")}</p>
              <p className="text-3xl md:text-4xl font-bold text-emerald-400">
                {latestWeight ? `${latestWeight} kg` : "—"}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 flex items-center justify-center min-h-[100px]">
              <p className="text-gray-600 text-sm">
                More metrics coming soon...
              </p>
            </div>
          </div>
        )}

        {/* Weight Entry Form — nur für Athleten */}
        {!isOnlyTrainer && (
          <div className="mb-6 md:mb-8">
            <WeightForm />
          </div>
        )}

        {/* Weight History — nur für Athleten */}
        {!isOnlyTrainer && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
            <h3 className="font-semibold mb-4">{t("weightTitle")}</h3>

            <div className="mb-6">
              <WeightChart entries={weightEntries} />
            </div>

            {weightEntries.length === 0 ? (
              <p className="text-gray-500 text-sm">Noch keine Einträge.</p>
            ) : (
              <div className="space-y-1">
                {weightEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center min-h-[44px] py-2 border-b border-gray-800 last:border-0"
                  >
                    <span className="text-gray-400 text-sm">
                      {new Date(entry.date).toLocaleDateString("de-CH")}{" "}
                      {new Date(entry.date).toLocaleTimeString("de-CH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="font-medium">{entry.weight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
