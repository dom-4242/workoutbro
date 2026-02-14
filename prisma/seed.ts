import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const hashedPassword = await bcrypt.hash("password123", 12);
  const trainerPassword = await bcrypt.hash("trainer123", 12);

  // Create athlete (you)
  const athlete = await prisma.user.upsert({
    where: { email: "dom@dom42.ch" },
    update: {},
    create: {
      email: "dom@dom42.ch",
      name: "Dom",
      password: hashedPassword,
      role: "ATHLETE",
    },
  });

  // Create trainer
  const trainer = await prisma.user.upsert({
    where: { email: "afonso@dom42.ch" },
    update: {},
    create: {
      email: "afonso@dom42.ch",
      name: "Afonso",
      password: trainerPassword,
      role: "TRAINER",
    },
  });

  console.log("✅ Seeded:", { athlete, trainer });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());