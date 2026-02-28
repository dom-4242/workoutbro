import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);
  const trainerPassword = await bcrypt.hash("trainer123", 12);

  // Create trainer first (needed for athlete's trainerId)
  const trainer = await prisma.user.upsert({
    where: { email: "afonso@dom42.ch" },
    update: {},
    create: {
      email: "afonso@dom42.ch",
      name: "Afonso",
      password: trainerPassword,
      roles: {
        create: [{ role: "TRAINER" }],
      },
    },
  });

  // Create athlete with trainer assigned
  const athlete = await prisma.user.upsert({
    where: { email: "dom@dom42.ch" },
    update: { trainerId: trainer.id },
    create: {
      email: "dom@dom42.ch",
      name: "Dom",
      password: hashedPassword,
      trainerId: trainer.id,
      roles: {
        create: [{ role: "ATHLETE" }, { role: "ADMIN" }],
      },
    },
  });

  // Create test exercises
  const exercise1 = await prisma.exercise.upsert({
    where: { name: "Test Exercise 1" },
    update: {},
    create: {
      name: "Test Exercise 1",
      category: "Kraft",
      requiredFields: ["WEIGHT", "REPS", "RPE", "NOTES"],
    },
  });

  const exercise2 = await prisma.exercise.upsert({
    where: { name: "Test Exercise 2" },
    update: {},
    create: {
      name: "Test Exercise 2",
      category: "Ausdauer",
      requiredFields: ["DISTANCE", "TIME", "RPE"],
    },
  });

  console.log("✅ Seeded:", { athlete, trainer, exercise1, exercise2 });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
