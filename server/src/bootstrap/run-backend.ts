import { startStandaloneNestApiServer } from "./nest-app";

async function main() {
  const server = await startStandaloneNestApiServer();

  const shutdown = () => {
    server.close((error) => {
      if (error) {
        console.error("Failed to close backend API server gracefully", error);
        process.exit(1);
        return;
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise<void>(() => {
    // Keep process alive while server is running.
  });
}

main().catch((error) => {
  console.error("Failed to start backend API server", error);
  process.exit(1);
});
