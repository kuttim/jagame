import "dotenv/config";
import { Client } from "pg";

/** The e-mail of an account made by a test; the pattern is also what cleanup deletes. */
export function testEmail(label: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `e2e-${label}-${random}@example.com`;
}

/**
 * Deletes the accounts the tests made, and their groups. Only e-mails of the
 * form e2e-...@example.com are touched, never anything else in the database.
 */
export async function deleteTestData(): Promise<number> {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set; the browser tests need the database from .env");
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const pattern = "e2e-%@example.com";
    // A group points at its owner, so the groups go first (members, expenses
    // and payments go with them).
    await client.query(
      'DELETE FROM "Group" WHERE "ownerId" IN (SELECT id FROM "User" WHERE email LIKE $1)',
      [pattern],
    );
    const result = await client.query('DELETE FROM "User" WHERE email LIKE $1', [pattern]);
    return result.rowCount ?? 0;
  } finally {
    await client.end();
  }
}
