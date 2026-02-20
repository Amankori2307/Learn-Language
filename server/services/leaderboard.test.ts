import test from "node:test";
import assert from "node:assert/strict";
import { computeLeaderboard } from "./leaderboard";

const users = [
  { id: "u1", firstName: "A", lastName: null, email: "a@example.com", profileImageUrl: null },
  { id: "u2", firstName: "B", lastName: null, email: "b@example.com", profileImageUrl: null },
  { id: "u3", firstName: "C", lastName: null, email: "c@example.com", profileImageUrl: null },
];

test("computeLeaderboard ranks by xp then streak then accuracy", () => {
  const now = new Date("2026-02-20T10:00:00.000Z");
  const attempts = [
    { userId: "u1", createdAt: now, isCorrect: true, difficulty: 1 },
    { userId: "u1", createdAt: now, isCorrect: true, difficulty: 3 }, // hard bonus
    { userId: "u2", createdAt: now, isCorrect: true, difficulty: 1 },
    { userId: "u2", createdAt: now, isCorrect: true, difficulty: 1 },
    { userId: "u2", createdAt: now, isCorrect: false, difficulty: 1 },
  ];

  const result = computeLeaderboard(users, attempts, 10);
  assert.equal(result[0].userId, "u1");
  assert.equal(result[1].userId, "u2");
  assert.equal(result[2].userId, "u3");
  assert.equal(result[0].rank, 1);
});

test("computeLeaderboard is deterministic on full ties using userId", () => {
  const now = new Date("2026-02-20T10:00:00.000Z");
  const attempts = [
    { userId: "u2", createdAt: now, isCorrect: true, difficulty: 1 },
    { userId: "u1", createdAt: now, isCorrect: true, difficulty: 1 },
  ];

  const result = computeLeaderboard(users.slice(0, 2), attempts, 10);
  assert.equal(result[0].userId, "u1");
  assert.equal(result[1].userId, "u2");
});

test("computeLeaderboard respects limit", () => {
  const result = computeLeaderboard(users, [], 2);
  assert.equal(result.length, 2);
  assert.equal(result[0].rank, 1);
  assert.equal(result[1].rank, 2);
});
