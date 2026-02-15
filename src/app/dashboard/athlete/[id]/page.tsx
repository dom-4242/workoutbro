import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import WeightChart from "@/components/ui/WeightChart";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AthleteDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const roles = ((session.user as any)?.roles as string[]) ?? [];
  const isTrainer = roles.includes("TRAINER");
  const isAdmin = roles.includes("ADMIN");

  // Only trainers and admins can view athlete pages
  if (!isTrainer && !isAdmin) redirect("/dashboard");

  // Verify this trainer has access to this athlete
  const athlete = await prisma.user.findFirst({
    where: {
      id,
      ...(isTrainer && !isAdmin ? { trainerId: (session.user as any).id } : {}),
    },
    include: {
      weightEntries: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!athlete) redirect("/dashboard");

  const latestWeight = athlete.weightEntries[0]?.weight ?? null;
  const t = await getTranslations("dashboard");

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg md:text-xl font-bold">{athlete.name}</h1>
        </div>
        <span className="text-xs font-mono text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-1 rounded">
          TRAINER VIEW
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
          {t("welcome", { name: athlete.name })}
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
            <p className="text-gray-400 text-sm mb-1">{t("todayWeight")}</p>
            <p className="text-3xl md:text-4xl font-bold text-emerald-400">
              {latestWeight ? `${latestWeight} kg` : "—"}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 flex items-center justify-center min-h-[100px]">
            <p className="text-gray-600 text-sm">More metrics coming soon...</p>
          </div>
        </div>

        {/* Weight History */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6">
          <h3 className="font-semibold mb-4">{t("weightTitle")}</h3>

          <div className="mb-6">
            <WeightChart entries={athlete.weightEntries} />
          </div>

          {athlete.weightEntries.length === 0 ? (
            <p className="text-gray-500 text-sm">Noch keine Einträge.</p>
          ) : (
            <div className="space-y-1">
              {athlete.weightEntries.map((entry) => (
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
      </div>
    </main>
  );
}
