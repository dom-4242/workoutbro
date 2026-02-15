"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addWeightEntry(formData: FormData) {
  // Check session
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const weight = parseFloat(formData.get("weight") as string);
  const note = formData.get("note") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;

  // Validate
  if (isNaN(weight) || weight < 20 || weight > 300) {
    throw new Error("Invalid weight value");
  }

  // Combine date and time into one DateTime
  const dateTime = new Date(`${dateStr}T${timeStr}:00`);

  // Save to database
  await prisma.weightEntry.create({
    data: {
      weight,
      note: note || null,
      date: dateTime,
      userId: (session.user as any).id,
    },
  });

  // Refresh the dashboard page
  revalidatePath("/dashboard");
}
