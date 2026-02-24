export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDay(dayKey: string, delta: number): string {
  const d = new Date(`${dayKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDayKey(d);
}

export function computeStreak(attemptDates: Date[]): number {
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
}

export function computeXp(params: {
  correctAttempts: number;
  hardCorrectAttempts: number;
}): number {
  return params.correctAttempts * 10 + params.hardCorrectAttempts * 5;
}
