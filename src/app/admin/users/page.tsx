import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateUserForm from "@/components/ui/CreateUserForm";
import ToggleUserButton from "@/components/ui/ToggleUserButton";
import AssignTrainerSelect from "@/components/ui/AssignTrainerSelect";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const users = await prisma.user.findMany({
    include: { roles: true },
    orderBy: { createdAt: "asc" },
  });

  // Extract trainers for the dropdown
  const trainers = users
    .filter((u) => u.roles.some((r) => r.role === "TRAINER"))
    .map((u) => ({ id: u.id, name: u.name }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Benutzerverwaltung</h2>
        <span className="text-sm text-gray-500">{users.length} Benutzer</span>
      </div>

      <CreateUserForm />

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-800 text-xs font-mono text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Name / Email</div>
          <div className="col-span-2">Rollen</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Trainer</div>
          <div className="col-span-2">Aktion</div>
        </div>

        {users.map((user) => {
          const isAthlete = user.roles.some((r) => r.role === "ATHLETE");

          return (
            <div
              key={user.id}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-800 last:border-0 items-center hover:bg-gray-800/50 transition-colors"
            >
              {/* Name & Email */}
              <div className="col-span-3">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
              </div>

              {/* Roles */}
              <div className="col-span-2 flex flex-wrap gap-1">
                {user.roles.map((r) => (
                  <span
                    key={r.id}
                    className={`text-xs font-mono px-2 py-0.5 rounded border ${
                      r.role === "ADMIN"
                        ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                        : r.role === "TRAINER"
                          ? "text-blue-400 border-blue-400/30 bg-blue-400/10"
                          : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                    }`}
                  >
                    {r.role}
                  </span>
                ))}
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    user.isActive
                      ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                      : "text-red-400 border-red-400/30 bg-red-400/10"
                  }`}
                >
                  {user.isActive ? "AKTIV" : "INAKTIV"}
                </span>
              </div>

              {/* Trainer Assignment — only for athletes */}
              <div className="col-span-3">
                {isAthlete ? (
                  <AssignTrainerSelect
                    athleteId={user.id}
                    currentTrainerId={user.trainerId}
                    trainers={trainers}
                  />
                ) : (
                  <span className="text-gray-600 text-xs">—</span>
                )}
              </div>

              {/* Toggle Active */}
              <div className="col-span-2">
                <ToggleUserButton userId={user.id} isActive={user.isActive} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
