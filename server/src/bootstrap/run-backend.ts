import { startStandaloneNestApiServer } from "./nest-app";

async function main() {
  await startStandaloneNestApiServer();
}

main().catch((error) => {
  console.error("Failed to start backend API server", error);
  process.exit(1);
});

