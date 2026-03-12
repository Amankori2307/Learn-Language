import { describe, expect, it } from "vitest";
import { QUERY_BEHAVIOR_RULES } from "./query-behavior";

describe("QUERY_BEHAVIOR_RULES", () => {
  it("keeps the auth user query on a finite stale window", () => {
    expect(QUERY_BEHAVIOR_RULES.auth.userStaleTimeMs).toBe(1000 * 60 * 5);
  });

  it("keeps quiz generation fresh and opt-out of focus refetches", () => {
    expect(QUERY_BEHAVIOR_RULES.quiz.generateStaleTimeMs).toBe(0);
    expect(QUERY_BEHAVIOR_RULES.quiz.refetchOnWindowFocus).toBe(false);
  });
});
