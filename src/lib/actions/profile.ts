"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { validateLocale } from "@/lib/locale";

export type ChangePasswordResult =
  | { success: true }
  | { success: false; error: string };

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  if (!currentPassword || !newPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user) return { success: false, error: "User not found" };

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return { success: false, error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

// Form action: called with FormData when used as <form action={setLocale}>
// The locale is passed as the "locale" field (submit button's name/value).
export async function setLocale(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const locale = formData.get("locale") as string;
  if (!validateLocale(locale)) throw new Error("Invalid locale");

  // Save to DB — request.ts reads locale directly from DB for authenticated users,
  // so no cookie propagation needed.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { locale },
  });

  redirect("/dashboard/settings");
}
