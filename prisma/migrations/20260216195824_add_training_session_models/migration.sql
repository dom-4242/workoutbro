-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('DRAFT', 'RELEASED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('TOO_EASY', 'JUST_RIGHT', 'TOO_HARD');

-- CreateEnum
CREATE TYPE "BodyRegion" AS ENUM ('NECK_SHOULDERS', 'CHEST', 'UPPER_BACK', 'LOWER_BACK', 'ABS', 'LEFT_ARM', 'RIGHT_ARM', 'LEFT_THIGH_FRONT', 'LEFT_THIGH_BACK', 'RIGHT_THIGH_FRONT', 'RIGHT_THIGH_BACK', 'LEFT_CALF', 'RIGHT_CALF', 'LEFT_KNEE', 'RIGHT_KNEE');

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "athleteId" TEXT NOT NULL,
    "trainerId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRound" (
    "id" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'DRAFT',
    "sessionId" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SessionRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundExercise" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "roundId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "plannedWeight" DOUBLE PRECISION,
    "plannedReps" INTEGER,
    "plannedDistance" DOUBLE PRECISION,
    "plannedTime" INTEGER,
    "plannedRPE" INTEGER,
    "trainerNotes" TEXT,
    "difficulty" "ExerciseDifficulty",
    "hadPain" BOOLEAN NOT NULL DEFAULT false,
    "painRegions" "BodyRegion"[],
    "athleteNotes" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RoundExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSession_athleteId_status_idx" ON "TrainingSession"("athleteId", "status");

-- CreateIndex
CREATE INDEX "TrainingSession_trainerId_status_idx" ON "TrainingSession"("trainerId", "status");

-- CreateIndex
CREATE INDEX "SessionRound_sessionId_status_idx" ON "SessionRound"("sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SessionRound_sessionId_roundNumber_key" ON "SessionRound"("sessionId", "roundNumber");

-- CreateIndex
CREATE INDEX "RoundExercise_roundId_idx" ON "RoundExercise"("roundId");

-- CreateIndex
CREATE INDEX "RoundExercise_exerciseId_idx" ON "RoundExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundExercise_roundId_order_key" ON "RoundExercise"("roundId", "order");

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRound" ADD CONSTRAINT "SessionRound_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundExercise" ADD CONSTRAINT "RoundExercise_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "SessionRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundExercise" ADD CONSTRAINT "RoundExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
