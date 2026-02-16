"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { ExerciseCategory, ExerciseField } from "@prisma/client";

// Helper: Check admin access
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any)?.id;
  if (!userId) throw new Error("User ID not found in session");

  const roles = ((session.user as any)?.roles as string[]) ?? [];
  if (!roles.includes("ADMIN")) throw new Error("Forbidden");

  return { session, userId };
}

// Create exercise
export async function createExercise(formData: FormData) {
  const { userId } = await requireAdmin();

  const name = formData.get("name") as string;
  const category = formData.get("category") as ExerciseCategory;
  const customCategory = formData.get("customCategory") as string | null;
  const requiredFields = formData.getAll("requiredFields") as ExerciseField[];
  const videoFile = formData.get("video") as File | null;

  // Validate
  if (!name || !category) {
    throw new Error("Name und Kategorie sind erforderlich");
  }
  if (requiredFields.length === 0) {
    throw new Error("Mindestens ein Feld muss ausgewählt werden");
  }

  // Handle video upload
  let videoPath = null;
  if (videoFile && videoFile.size > 0) {
    if (videoFile.size > 50 * 1024 * 1024) {
      throw new Error("Video muss kleiner als 50MB sein");
    }

    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = videoFile.name.split(".").pop();
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(
      process.cwd(),
      "public",
      "exercise-videos",
      filename,
    );

    await writeFile(filepath, buffer);
    videoPath = `/exercise-videos/${filename}`;
  }

  // Create exercise
  await prisma.exercise.create({
    data: {
      name,
      category,
      customCategory: category === "CUSTOM" ? customCategory : null,
      videoPath,
      requiredFields,
      createdBy: userId,
    },
  });

  revalidatePath("/admin/exercises");
}

// Update exercise
export async function updateExercise(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const category = formData.get("category") as ExerciseCategory;
  const customCategory = formData.get("customCategory") as string | null;
  const requiredFields = formData.getAll("requiredFields") as ExerciseField[];
  const videoFile = formData.get("video") as File | null;

  // Validate
  if (!name || !category) {
    throw new Error("Name und Kategorie sind erforderlich");
  }
  if (requiredFields.length === 0) {
    throw new Error("Mindestens ein Feld muss ausgewählt werden");
  }

  // Get existing exercise
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Übung nicht gefunden");
  }

  // Handle video upload
  let videoPath = existing.videoPath;
  if (videoFile && videoFile.size > 0) {
    if (videoFile.size > 50 * 1024 * 1024) {
      throw new Error("Video muss kleiner als 50MB sein");
    }

    // Delete old video if exists
    if (existing.videoPath) {
      const oldFilepath = path.join(process.cwd(), "public", existing.videoPath);
      await unlink(oldFilepath).catch(() => {}); // Ignore if file doesn't exist
    }

    // Upload new video
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = videoFile.name.split(".").pop();
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const filepath = path.join(
      process.cwd(),
      "public",
      "exercise-videos",
      filename,
    );

    await writeFile(filepath, buffer);
    videoPath = `/exercise-videos/${filename}`;
  }

  // Update exercise
  await prisma.exercise.update({
    where: { id },
    data: {
      name,
      category,
      customCategory: category === "CUSTOM" ? customCategory : null,
      videoPath,
      requiredFields,
    },
  });

  revalidatePath("/admin/exercises");
}

// Delete exercise
export async function deleteExercise(id: string) {
  await requireAdmin();

  // Get exercise to find video path
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) {
    throw new Error("Übung nicht gefunden");
  }

  // Delete video file if exists
  if (exercise.videoPath) {
    const filepath = path.join(process.cwd(), "public", exercise.videoPath);
    await unlink(filepath).catch(() => {}); // Ignore if file doesn't exist
  }

  // Delete from DB
  await prisma.exercise.delete({ where: { id } });

  revalidatePath("/admin/exercises");
}

// Query exercises
export async function getExercises() {
  return await prisma.exercise.findMany({
    include: { creator: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}
