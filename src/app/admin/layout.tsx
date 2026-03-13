import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import AdminNav from "@/components/ui/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  if (!session.user.roles?.includes("ADMIN")) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Admin Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Dashboard
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold">Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton />
          <span className="text-xs font-mono text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 rounded">
            ADMIN
          </span>
        </div>
      </header>

      {/* Admin Navigation */}
      <AdminNav />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {children}
      </main>

    </div>
  );
}