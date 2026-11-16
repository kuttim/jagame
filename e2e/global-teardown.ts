import { deleteTestData } from "./cleanup";

export default async function globalTeardown() {
  const removed = await deleteTestData();
  console.log(`Cleaned up ${removed} test account(s).`);
}
