"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-gray-400 hover:text-white transition-colors min-h-[44px] px-2"
    >
      Logout
    </button>
  );
}