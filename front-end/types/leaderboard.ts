import { Difficulty } from ".";

export interface LeaderboardEntry {
  userId: string;
  totalScore: number;
  quizCount: number;
  difficulty: Difficulty;
  displayName: string;
  photoURL: string;
}
