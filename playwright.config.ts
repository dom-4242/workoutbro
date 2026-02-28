import { defineConfig, devices } from "@playwright/test";

import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  testDir: "./src/tests/e2e",
  globalSetup: require.resolve("./src/tests/global-setup.ts"),
  fullyParallel: false, // Session tests must run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPad Pro 11"] },
    },
  ],
  // Start dev server automatically before tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
