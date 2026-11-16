import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same alias as tsconfig.json: "@/..." means "src/..."
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The logic lives in src/lib. Pages, Server Actions and database access
      // are covered by the browser tests in e2e/ instead.
      include: ["src/lib/**/*.ts"],
      exclude: ["src/generated/**"],
      reporter: ["text"],
    },
  },
});
