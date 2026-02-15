"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// Helper to check if current user is admin
async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const roles = ((session.user as any)?.roles as string[]) ?? [];
  if (!roles.includes("ADMIN")) throw new Error("Forbidden");
  return session;
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roles = formData.getAll("roles") as Role[];

  // Validate
  if (!name || !email || !password || roles.length === 0) {
    throw new Error("All fields are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  // Hash password and create user with roles
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roles: {
        create: roles.map((role) => ({ role })),
      },
    },
  });

  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !isActive },
  });

  revalidatePath("/admin/users");
}

export async function assignTrainer(
  athleteId: string,
  trainerId: string | null,
) {
  await requireAdmin();

  console.log("assignTrainer called:", { athleteId, trainerId });

  await prisma.user.update({
    where: { id: athleteId },
    data: { trainerId: trainerId },
  });

  console.log("assignTrainer success!");

  revalidatePath("/admin/users");
}
