"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SessionStatus, RoundStatus, ExerciseDifficulty, BodyRegion } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";
import { PUSHER_EVENTS, getSessionChannel } from "@/lib/pusher-events";

// Helper: Require auth
async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ============================================
// ATHLETE ACTIONS
// ============================================

// ATHLETE: Start new training session
export async function startTrainingSession() {
  const session = await requireAuth();
  const userId = (session.user as any).id;

  // Check if user has trainer assigned
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trainerId: true },
  });

  if (!user?.trainerId) {
    throw new Error("Kein Trainer zugewiesen");
  }

  // Check if user already has active session
  const existing = await prisma.trainingSession.findFirst({
    where: {
      athleteId: userId,
      status: { in: ["WAITING", "ACTIVE"] },
    },
  });

  if (existing) {
    throw new Error("Du hast bereits eine aktive Session");
  }

  // Create new session
  const newSession = await prisma.trainingSession.create({
    data: {
      athleteId: userId,
      status: "WAITING",
    },
  });

  revalidatePath("/dashboard");
  return newSession.id;
}

// ATHLETE: Submit feedback and complete round
export async function completeRound(data: {
  roundId: string;
  feedback: Array<{
    exerciseId: string;
    difficulty: ExerciseDifficulty;
    hadPain: boolean;
    painRegions: BodyRegion[];
    athleteNotes?: string;
  }>;
}) {
  const session = await requireAuth();
  const athleteId = (session.user as any).id;

  // Verify access
  const round = await prisma.sessionRound.findUnique({
    where: { id: data.roundId },
    include: { session: true, exercises: true },
  });

  if (!round) {
    throw new Error("Runde nicht gefunden");
  }

  if (round.session.athleteId !== athleteId) {
    throw new Error("Keine Berechtigung");
  }

  if (round.status !== "RELEASED") {
    throw new Error("Runde ist nicht verfügbar");
  }

  // Validate: feedback for ALL exercises
  if (data.feedback.length !== round.exercises.length) {
    throw new Error("Feedback für alle Übungen erforderlich");
  }

  // Update all exercises with feedback
  await Promise.all(
    data.feedback.map((fb) =>
      prisma.roundExercise.update({
        where: { id: fb.exerciseId },
        data: {
          difficulty: fb.difficulty,
          hadPain: fb.hadPain,
          painRegions: fb.painRegions,
          athleteNotes: fb.athleteNotes,
          completedAt: new Date(),
        },
      }),
    ),
  );

  // Mark round as completed
  await prisma.sessionRound.update({
    where: { id: data.roundId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  // Notify trainer that round was completed
  await pusherServer.trigger(
    getSessionChannel(round.sessionId),
    PUSHER_EVENTS.ROUND_COMPLETED,
    { roundId: data.roundId, roundNumber: round.roundNumber },
  );

  // Check if this was the final round → complete session
  if (round.isFinalRound) {
    await prisma.trainingSession.update({
      where: { id: round.sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await pusherServer.trigger(
      getSessionChannel(round.sessionId),
      PUSHER_EVENTS.SESSION_COMPLETED,
      {},
    );

    revalidatePath("/dashboard");
  }

  revalidatePath(`/dashboard/session/${round.sessionId}`);
  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
}

// ============================================
// TRAINER ACTIONS
// ============================================

// TRAINER: Join waiting session
export async function joinTrainingSession(sessionId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify trainer access
  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: { athlete: true },
  });

  if (!trainingSession) {
    throw new Error("Session nicht gefunden");
  }

  if (trainingSession.athlete.trainerId !== trainerId) {
    throw new Error("Das ist nicht dein Athlet");
  }

  if (trainingSession.status !== "WAITING") {
    throw new Error("Session ist nicht mehr verfügbar");
  }

  // Join session
  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: {
      trainerId,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}

// TRAINER: Create/update round
export async function saveRound(data: {
  sessionId: string;
  roundId?: string; // If editing existing
  isFinalRound?: boolean;
  exercises: Array<{
    exerciseId: string;
    order: number;
    plannedWeight?: number;
    plannedReps?: number;
    plannedDistance?: number;
    plannedTime?: number;
    plannedRPE?: number;
    trainerNotes?: string;
  }>;
}) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify trainer access
  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: data.sessionId },
    select: { trainerId: true },
  });

  if (trainingSession?.trainerId !== trainerId) {
    throw new Error("Keine Berechtigung");
  }

  let roundId: string;

  if (data.roundId) {
    // Update existing round
    const updatedRound = await prisma.sessionRound.update({
      where: { id: data.roundId },
      data: {
        isFinalRound: data.isFinalRound ?? false,
        exercises: {
          deleteMany: {}, // Remove old exercises
          create: data.exercises,
        },
      },
    });
    roundId = data.roundId;

    // Notify athlete if a released round was updated
    if (updatedRound.status === "RELEASED") {
      await pusherServer.trigger(
        getSessionChannel(data.sessionId),
        PUSHER_EVENTS.ROUND_UPDATED,
        { roundId: data.roundId, roundNumber: updatedRound.roundNumber },
      );
    }
  } else {
    // Create new round
    const maxRound = await prisma.sessionRound.findFirst({
      where: { sessionId: data.sessionId },
      orderBy: { roundNumber: "desc" },
      select: { roundNumber: true },
    });

    const nextNumber = (maxRound?.roundNumber ?? 0) + 1;

    const newRound = await prisma.sessionRound.create({
      data: {
        sessionId: data.sessionId,
        roundNumber: nextNumber,
        status: "DRAFT",
        isFinalRound: data.isFinalRound ?? false,
        exercises: {
          create: data.exercises,
        },
      },
    });
    roundId = newRound.id;
  }

  revalidatePath(`/dashboard/session/${data.sessionId}/trainer`);

  return roundId;
}

// TRAINER: Release round
export async function releaseRound(roundId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify access
  const round = await prisma.sessionRound.findUnique({
    where: { id: roundId },
    include: { session: true },
  });

  if (!round) {
    throw new Error("Runde nicht gefunden");
  }

  if (round.session.trainerId !== trainerId) {
    throw new Error("Keine Berechtigung");
  }

  if (round.status !== "DRAFT") {
    throw new Error("Runde kann nicht mehr freigegeben werden");
  }

  // Validate: at least one exercise
  const exerciseCount = await prisma.roundExercise.count({
    where: { roundId },
  });

  if (exerciseCount === 0) {
    throw new Error("Runde muss mindestens eine Übung enthalten");
  }

  await prisma.sessionRound.update({
    where: { id: roundId },
    data: {
      status: "RELEASED",
      releasedAt: new Date(),
    },
  });

  // Notify athlete that round was released
  await pusherServer.trigger(
    getSessionChannel(round.sessionId),
    PUSHER_EVENTS.ROUND_RELEASED,
    { roundId, roundNumber: round.roundNumber },
  );

  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
  revalidatePath(`/dashboard/session/${round.sessionId}`);
}

// TRAINER: Delete draft round
export async function deleteRound(roundId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  // Verify access
  const round = await prisma.sessionRound.findUnique({
    where: { id: roundId },
    include: { session: true },
  });

  if (!round) {
    throw new Error("Runde nicht gefunden");
  }

  if (round.session.trainerId !== trainerId) {
    throw new Error("Keine Berechtigung");
  }

  if (round.status !== "DRAFT") {
    throw new Error("Nur Entwürfe können gelöscht werden");
  }

  // Delete exercises first, then round
  await prisma.roundExercise.deleteMany({
    where: { roundId },
  });

  await prisma.sessionRound.delete({
    where: { id: roundId },
  });

  // Notify athlete that round was deleted
  await pusherServer.trigger(
    getSessionChannel(round.sessionId),
    PUSHER_EVENTS.ROUND_DELETED,
    { roundId, roundNumber: round.roundNumber },
  );

  revalidatePath(`/dashboard/session/${round.sessionId}/trainer`);
}

// TRAINER/ATHLETE: Cancel session
export async function cancelSession(sessionId: string) {
  const session = await requireAuth();
  const userId = (session.user as any).id;

  const trainingSession = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    select: { athleteId: true, trainerId: true },
  });

  if (!trainingSession) throw new Error("Session nicht gefunden");

  const isAuthorized =
    trainingSession.athleteId === userId ||
    trainingSession.trainerId === userId;

  if (!isAuthorized) throw new Error("Keine Berechtigung");

  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });

  // Notify other party that session was cancelled
  const cancelledBy =
    trainingSession.athleteId === userId ? "ATHLETE" : "TRAINER";

  await pusherServer.trigger(
    getSessionChannel(sessionId),
    PUSHER_EVENTS.SESSION_CANCELLED,
    { cancelledBy },
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/session/${sessionId}`);
}

// ============================================
// QUERY ACTIONS (Both Athlete and Trainer)
// ============================================

// Query: Get session for athlete
export async function getAthleteSession(sessionId: string) {
  const session = await requireAuth();
  const athleteId = (session.user as any).id;

  return await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      athleteId,
    },
    include: {
      trainer: { select: { name: true } },
      rounds: {
        where: {
          status: { in: ["RELEASED", "ACTIVE", "COMPLETED"] },
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });
}

// Query: Get session for trainer
export async function getTrainerSession(sessionId: string) {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  return await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      trainerId,
    },
    include: {
      athlete: { select: { name: true } },
      rounds: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });
}

// Query: Get available exercises
export async function getAvailableExercises() {
  await requireAuth();
  return await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, requiredFields: true },
  });
}

// Query: Get active sessions for trainer
export async function getTrainerActiveSessions() {
  const session = await requireAuth();
  const trainerId = (session.user as any).id;

  const waiting = await prisma.trainingSession.findMany({
    where: {
      athlete: { trainerId },
      status: "WAITING",
    },
    include: { athlete: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
  });

  const active = await prisma.trainingSession.findMany({
    where: {
      trainerId,
      status: "ACTIVE",
    },
    include: { athlete: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
  });

  return { waiting, active };
}
