-- Migration: Replace ExerciseDifficulty enum with Borg CR-10 integer (rpe)

-- Step 1: Drop the difficulty column
ALTER TABLE "RoundExercise" DROP COLUMN IF EXISTS "difficulty";

-- Step 2: Add the new rpe column (integer, 0-10, nullable)
ALTER TABLE "RoundExercise" ADD COLUMN "rpe" INTEGER;

-- Step 3: Drop the ExerciseDifficulty enum type
DROP TYPE IF EXISTS "ExerciseDifficulty";
