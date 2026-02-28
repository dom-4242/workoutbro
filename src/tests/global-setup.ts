import { execSync } from "child_process";

async function globalSetup() {
  console.log("Resetting test database...");

  // Reset database
  execSync("npx prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
  });

  // Seed with test data
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
  });

  console.log("Database ready for tests!");
}

export default globalSetup;
