import test from "node:test";
import assert from "node:assert/strict";
import { summarizeSrsDrift } from "./srs-drift";

test("summarizeSrsDrift raises critical overdue alert for high overdue ratio", () => {
  const summary = summarizeSrsDrift({
    overdueCount: 70,
    totalTracked: 100,
    highIntervalCount: 10,
    emptyReviewDays: 0,
    generatedAt: new Date("2026-02-21T00:00:00.000Z"),
  });
  assert.ok(summary.alerts.some((alert) => alert.code === "overdue_growth" && alert.severity === "critical"));
});

test("summarizeSrsDrift raises warning for interval spikes and empty review days", () => {
  const summary = summarizeSrsDrift({
    overdueCount: 10,
    totalTracked: 30,
    highIntervalCount: 8,
    emptyReviewDays: 3,
  });
  assert.ok(summary.alerts.some((alert) => alert.code === "interval_spike" && alert.severity === "warning"));
  assert.ok(summary.alerts.some((alert) => alert.code === "empty_review_days" && alert.severity === "warning"));
});
