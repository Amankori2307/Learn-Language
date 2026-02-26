import { XP_RULES } from "./stats.constants";
import { runWithLifecycle } from "../../common/logger/logger";

export function toDayKey(date: Date): string {
  return runWithLifecycle("toDayKey", () => date.toISOString().slice(0, 10));
}

function shiftDay(dayKey: string, delta: number): string {
  return runWithLifecycle("shiftDay", () => {
    const d = new Date(`${dayKey}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    return toDayKey(d);
  });
}

export function computeStreak(attemptDates: Date[]): number {
  return runWithLifecycle("computeStreak", () => {
    if (attemptDates.length === 0) return 0;

  const days = Array.from(new Set(attemptDates.map(toDayKey))).sort().reverse();
  let streak = 1;
  let cursor = days[0];

  for (let i = 1; i < days.length; i += 1) {
    const expected = shiftDay(cursor, -1);
    if (days[i] === expected) {
      streak += 1;
      cursor = days[i];
    } else {
      break;
    }
  }

    return streak;
  });
}

export function computeXp(params: {
  correctAttempts: number;
  hardCorrectAttempts: number;
}): number {
  return runWithLifecycle("computeXp", () =>
    params.correctAttempts * XP_RULES.CORRECT_ATTEMPT_POINTS +
    params.hardCorrectAttempts * XP_RULES.HARD_CORRECT_BONUS_POINTS,
  );
}
