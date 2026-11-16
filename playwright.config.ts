import { defineConfig } from "@playwright/test";

// Browser tests of the main flow. They use the real Chrome that is installed
// on the computer (no separate browser download) and a production build of
// the app on port 3100.
//
// IMPORTANT: the tests create accounts and groups in the database from `.env`
// and delete them again afterwards (only accounts whose e-mail looks like
// e2e-...@example.com). If your `.env` points at the live database, use a
// separate Neon branch for testing, see README.

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  // One test at a time: they share one database
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    channel: "chrome",
    locale: "et-EE",
    viewport: { width: 1000, height: 1000 },
    trace: "retain-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npm start -- -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 240_000,
        env: { AUTH_TRUST_HOST: "true" },
      },
});
