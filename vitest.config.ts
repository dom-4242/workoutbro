import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node", // Unit Tests brauchen kein Browser-Environment
    globals: true,
    pool: "vmThreads", // Isolierte VM-Threads für bessere Test-Isolation
    setupFiles: ["./src/tests/setup.ts"],
    environmentMatchGlobs: [
      ["**/*.test.tsx", "jsdom"], // Komponenten-Tests: jsdom
    ],
    exclude: [
      "**/node_modules/**",
      "**/e2e/**", // ← Playwright Tests ignorieren
      "**/.claude/**", // ← Git Worktrees ignorieren
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
