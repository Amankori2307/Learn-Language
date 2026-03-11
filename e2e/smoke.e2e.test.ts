import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { createServer } from "http";
import { QuizModeEnum } from "../shared/domain/enums";

test("e2e smoke: auth, analytics, cluster, and quiz critical paths are live", async (t) => {
  const issuerServer = createServer((req, res) => {
    const address = issuerServer.address();
    const port = address && typeof address !== "string" ? address.port : 0;

    if (req.url === "/.well-known/openid-configuration") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          issuer: `http://127.0.0.1:${port}`,
          authorization_endpoint: `http://127.0.0.1:${port}/auth`,
          token_endpoint: `http://127.0.0.1:${port}/token`,
          jwks_uri: `http://127.0.0.1:${port}/jwks`,
          userinfo_endpoint: `http://127.0.0.1:${port}/userinfo`,
          response_types_supported: ["code"],
          subject_types_supported: ["public"],
          id_token_signing_alg_values_supported: ["RS256"],
        }),
      );
      return;
    }

    if (req.url === "/jwks") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ keys: [] }));
      return;
    }

    res.writeHead(404);
    res.end("not found");
  });

  await new Promise<void>((resolve) => {
    issuerServer.listen(0, "127.0.0.1", () => resolve());
  });

  t.after(async () => {
    await new Promise<void>((resolve, reject) => {
      issuerServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  const issuerAddress = issuerServer.address();
  if (!issuerAddress || typeof issuerAddress === "string") {
    throw new Error("Unable to resolve mock issuer server address");
  }

  process.env.AUTH_PROVIDER = "google";
  process.env.GOOGLE_CLIENT_ID = "smoke-test-client";
  process.env.GOOGLE_CLIENT_SECRET = "smoke-test-secret";
  process.env.GOOGLE_ISSUER_URL = `http://127.0.0.1:${issuerAddress.port}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "ci-jwt-secret-min-16";

  const [{ db }, { createNestApiApp }] = await Promise.all([
    import("../server/src/infrastructure/db"),
    import("../server/src/main"),
  ]);

  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    const serializedError = JSON.stringify(error, Object.getOwnPropertyNames(error ?? {}));
    const hasDbConnectionPermissionIssue =
      code === "ECONNREFUSED" ||
      code === "EPERM" ||
      serializedError.includes("ECONNREFUSED") ||
      serializedError.includes("EPERM");

    if (hasDbConnectionPermissionIssue) {
      t.skip("Postgres is unavailable in current environment; skipping e2e smoke");
      return;
    }
    throw error;
  }

  const { expressApp, app: nestApp } = await createNestApiApp();
  await nestApp.init();
  const httpServer = createServer(expressApp);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => resolve());
  });

  t.after(async () => {
    await nestApp.close();
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
  const authToken = jwt.sign(
    {
      sub: "smoke-user",
      email: "smoke@example.com",
      given_name: "Smoke",
      family_name: "Test",
    },
    process.env.JWT_SECRET as string,
    { algorithm: "HS256", expiresIn: "1h" },
  );
  const authHeaders = {
    Authorization: `Bearer ${authToken}`,
  };

  const authMeResponse = await fetch(`${baseUrl}/auth/me`, {
    headers: authHeaders,
  });
  assert.equal(authMeResponse.status, 200, "/auth/me should return 200");
  const authMePayload = await authMeResponse.json();
  assert.equal(authMePayload.id, "smoke-user");
  assert.equal(authMePayload.email, "smoke@example.com");

  const profileResponse = await fetch(`${baseUrl}/api/profile`, {
    headers: authHeaders,
  });
  assert.equal(profileResponse.status, 200, "/api/profile should return 200");
  const profilePayload = await profileResponse.json();
  assert.equal(profilePayload.id, "smoke-user");

  const statsResponse = await fetch(`${baseUrl}/api/stats?language=telugu`, {
    headers: authHeaders,
  });
  assert.equal(statsResponse.status, 200, "/api/stats should return 200");
  const statsPayload = await statsResponse.json();
  assert.equal(typeof statsPayload.totalWords, "number");

  const learningResponse = await fetch(`${baseUrl}/api/analytics/learning?language=telugu`, {
    headers: authHeaders,
  });
  assert.equal(learningResponse.status, 200, "/api/analytics/learning should return 200");
  const learningPayload = await learningResponse.json();
  assert.equal(Array.isArray(learningPayload.clusters), true);

  const wordBucketsResponse = await fetch(
    `${baseUrl}/api/analytics/word-buckets?bucket=learning&page=1&limit=5&language=telugu`,
    {
      headers: authHeaders,
    },
  );
  assert.equal(wordBucketsResponse.status, 200, "/api/analytics/word-buckets should return 200");
  const wordBucketsPayload = await wordBucketsResponse.json();
  assert.equal(Array.isArray(wordBucketsPayload.words), true);

  const attemptHistoryResponse = await fetch(
    `${baseUrl}/api/attempts/history?limit=5&language=telugu`,
    {
      headers: authHeaders,
    },
  );
  assert.equal(attemptHistoryResponse.status, 200, "/api/attempts/history should return 200");
  const attemptHistoryPayload = await attemptHistoryResponse.json();
  assert.equal(Array.isArray(attemptHistoryPayload), true);

  const leaderboardResponse = await fetch(
    `${baseUrl}/api/leaderboard?window=weekly&limit=5&language=telugu`,
    {
      headers: authHeaders,
    },
  );
  assert.equal(leaderboardResponse.status, 200, "/api/leaderboard should return 200");
  const leaderboardPayload = await leaderboardResponse.json();
  assert.equal(Array.isArray(leaderboardPayload), true);

  const clustersResponse = await fetch(`${baseUrl}/api/clusters?language=telugu`, {
    headers: authHeaders,
  });
  assert.equal(clustersResponse.status, 200, "/api/clusters should return 200");
  const clustersPayload = await clustersResponse.json();
  assert.equal(Array.isArray(clustersPayload), true, "/api/clusters should return array payload");

  const firstCluster = clustersPayload[0];
  if (firstCluster?.id) {
    const clusterDetailResponse = await fetch(
      `${baseUrl}/api/clusters/${firstCluster.id}?language=telugu`,
      {
        headers: authHeaders,
      },
    );
    assert.equal(clusterDetailResponse.status, 200, "/api/clusters/:id should return 200");
    const clusterDetailPayload = await clusterDetailResponse.json();
    assert.equal(clusterDetailPayload.id, firstCluster.id);
  }

  const modes = [
    QuizModeEnum.DAILY_REVIEW,
    QuizModeEnum.NEW_WORDS,
    QuizModeEnum.CLUSTER,
    QuizModeEnum.WEAK_WORDS,
    QuizModeEnum.LISTEN_IDENTIFY,
    QuizModeEnum.COMPLEX_WORKOUT,
  ];

  for (const mode of modes) {
    const response = await fetch(
      `${baseUrl}/api/quiz/generate?mode=${mode}&count=3&language=telugu`,
      {
        headers: authHeaders,
      },
    );
    assert.equal(response.status, 200, `mode=${mode} should return 200`);
    const payload = await response.json();
    assert.equal(Array.isArray(payload), true, `mode=${mode} should return array payload`);
  }
});
