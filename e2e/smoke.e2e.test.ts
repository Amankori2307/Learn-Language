import test from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { createServer } from "http";
import { db } from "../server/nest/src/infrastructure/db";
import { getNestExpressApp } from "../server/nest/src/bootstrap/nest-app";
import { QuizModeEnum } from "../shared/domain/enums";

test("e2e smoke: api is live and all quiz modes return arrays", async (t) => {
  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "ECONNREFUSED" || code === "EPERM") {
      t.skip("Postgres is unavailable in current environment; skipping e2e smoke");
      return;
    }
    throw error;
  }

  const app = await getNestExpressApp();
  const httpServer = createServer(app);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => resolve());
  });

  t.after(async () => {
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  const address = httpServer.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve test server address");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const modes = [
    QuizModeEnum.DAILY_REVIEW,
    QuizModeEnum.NEW_WORDS,
    QuizModeEnum.CLUSTER,
    QuizModeEnum.WEAK_WORDS,
    QuizModeEnum.LISTEN_IDENTIFY,
    QuizModeEnum.COMPLEX_WORKOUT,
  ];

  for (const mode of modes) {
    const response = await fetch(`${baseUrl}/api/quiz/generate?mode=${mode}&count=3&language=telugu`);
    assert.equal(response.status, 200, `mode=${mode} should return 200`);
    const payload = await response.json();
    assert.equal(Array.isArray(payload), true, `mode=${mode} should return array payload`);
  }
});
