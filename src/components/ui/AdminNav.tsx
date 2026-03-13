"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/users", label: "Benutzerverwaltung" },
  { href: "/admin/exercises", label: "Übungsverwaltung" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 px-4 md:px-6">
      <div className="flex gap-1">
        {navItems.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                isActive
                  ? "text-white border-emerald-500"
                  : "text-gray-400 hover:text-white border-transparent hover:border-emerald-500"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
