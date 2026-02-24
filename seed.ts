
import { storage } from "./server/nest/src/infrastructure/storage";

async function main() {
  console.log("Seeding database...");
  await storage.seedInitialData();
  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
