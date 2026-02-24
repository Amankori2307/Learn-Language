import { computeStreak, computeXp } from "./stats";

interface IUserIdentity {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

interface IAttemptRow {
  userId: string;
  createdAt: Date | null;
  isCorrect: boolean;
  difficulty: number | null;
}

export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  xp: number;
  streak: number;
  attempts: number;
  accuracy: number;
}

export function computeLeaderboard(
  users: IUserIdentity[],
  attempts: IAttemptRow[],
  limit: number,
): ILeaderboardEntry[] {
  const byUser = new Map<string, IAttemptRow[]>();
  for (const attempt of attempts) {
    const list = byUser.get(attempt.userId) ?? [];
    list.push(attempt);
    byUser.set(attempt.userId, list);
  }

  const rows: ILeaderboardEntry[] = users.map((user) => {
    const userAttempts = byUser.get(user.id) ?? [];
    const correctAttempts = userAttempts.filter((a) => a.isCorrect).length;
    const hardCorrectAttempts = userAttempts.filter((a) => a.isCorrect && (a.difficulty ?? 1) >= 3).length;
    const streak = computeStreak(
      userAttempts
        .map((row) => row.createdAt)
        .filter((date): date is Date => Boolean(date)),
    );
    const xp = computeXp({ correctAttempts, hardCorrectAttempts });
    const accuracy = userAttempts.length > 0
      ? Number(((correctAttempts / userAttempts.length) * 100).toFixed(1))
      : 0;

    return {
      rank: 0,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      xp,
      streak,
      attempts: userAttempts.length,
      accuracy,
    };
  });

  rows.sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.streak !== a.streak) return b.streak - a.streak;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return a.userId.localeCompare(b.userId);
  });

  return rows.slice(0, limit).map((row, idx) => ({ ...row, rank: idx + 1 }));
}
