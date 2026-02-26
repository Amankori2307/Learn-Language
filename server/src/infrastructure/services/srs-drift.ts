export type DriftAlert = {
  code: "overdue_growth" | "interval_spike" | "empty_review_days";
  severity: "warning" | "critical";
  message: string;
};

export type SrsDriftSummary = {
  generatedAt: string;
  overdueCount: number;
  totalTracked: number;
  overdueRatio: number;
  highIntervalCount: number;
  highIntervalRatio: number;
  emptyReviewDays: number;
  alerts: DriftAlert[];
};

export function summarizeSrsDrift(input: {
  overdueCount: number;
  totalTracked: number;
  highIntervalCount: number;
  emptyReviewDays: number;
  generatedAt?: Date;
}): SrsDriftSummary {
  const totalTracked = Math.max(0, input.totalTracked);
  const overdueCount = Math.max(0, input.overdueCount);
  const highIntervalCount = Math.max(0, input.highIntervalCount);
  const emptyReviewDays = Math.max(0, input.emptyReviewDays);

  const overdueRatio = totalTracked > 0 ? overdueCount / totalTracked : 0;
  const highIntervalRatio = totalTracked > 0 ? highIntervalCount / totalTracked : 0;

  const alerts: DriftAlert[] = [];
  if (overdueRatio >= 0.55) {
    alerts.push({
      code: "overdue_growth",
      severity: "critical",
      message: "Overdue queue exceeds 55% of tracked progress rows.",
    });
  } else if (overdueRatio >= 0.35) {
    alerts.push({
      code: "overdue_growth",
      severity: "warning",
      message: "Overdue queue exceeds 35% of tracked progress rows.",
    });
  }

  if (highIntervalRatio >= 0.2) {
    alerts.push({
      code: "interval_spike",
      severity: "warning",
      message: "High-interval progress rows exceed 20% of tracked progress rows.",
    });
  }

  if (emptyReviewDays >= 5) {
    alerts.push({
      code: "empty_review_days",
      severity: "critical",
      message: "No review attempts detected for 5+ days.",
    });
  } else if (emptyReviewDays >= 2) {
    alerts.push({
      code: "empty_review_days",
      severity: "warning",
      message: "No review attempts detected for 2+ days.",
    });
  }

  return {
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    overdueCount,
    totalTracked,
    overdueRatio: Number(overdueRatio.toFixed(4)),
    highIntervalCount,
    highIntervalRatio: Number(highIntervalRatio.toFixed(4)),
    emptyReviewDays,
    alerts,
  };
}
