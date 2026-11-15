// Quick check that the app can talk to the database: `npm run db:check`.
import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  const [{ now }] = await db.$queryRaw<{ now: Date }[]>`SELECT now() AS now`;
  const groups = await db.group.count();
  console.log(`Database OK. Server time: ${now.toISOString()}, groups: ${groups}`);
}

main()
  .catch((error) => {
    console.error("Database check failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
