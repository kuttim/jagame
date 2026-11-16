import { deleteTestData } from "./cleanup";

// Clears what an earlier, interrupted run may have left behind.
export default async function globalSetup() {
  await deleteTestData();
}
