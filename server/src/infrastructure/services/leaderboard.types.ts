export interface IUserIdentity {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

export interface IAttemptRow {
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
