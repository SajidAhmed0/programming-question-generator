import { DifficultyLevel } from ".";

export interface LeaderboardEntry {
  userId: string;
  totalScore: number;
  quizCount: number;
  difficulty: DifficultyLevel;
  displayName: string;
  photoURL: string;
}
