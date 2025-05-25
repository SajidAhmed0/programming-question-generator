"use server";

import { db } from "@/config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit as limitQuery,
  getDocs,
} from "firebase/firestore";
import { AnyQuestion, Difficulty, QuizFeedback } from "@/types";

export interface QuizResult {
  userId: string;
  score: number;
  difficulty: Difficulty;
  timeSpent: string;
  startedAt: string;
  completedAt: string;
  answers: Record<string, string>;
  feedback: QuizFeedback[];
  questions: AnyQuestion[];
}

export async function saveQuizResult(result: QuizResult) {
  try {
    const quizResultRef = doc(collection(db, "quizResults"));
    await setDoc(quizResultRef, {
      ...result,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: quizResultRef.id };
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return { success: false, error: "Failed to save quiz result" };
  }
}

export async function getRecentQuizzes(
  userId: string,
  maxResults: number = 10
) {
  try {
    const quizResultsRef = collection(db, "quizResults");
    const q = query(
      quizResultsRef,
      where("userId", "==", userId),
      orderBy("completedAt", "desc"),
      limitQuery(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as QuizResult),
    }));

    return { success: true, data: results };
  } catch (error) {
    console.error("Error fetching recent quizzes:", error);
    return { success: false, error: "Failed to fetch recent quizzes" };
  }
}

export async function getQuizResult(quizId: string) {
  try {
    const quizResultRef = doc(db, "quizResults", quizId);
    const document = await getDoc(quizResultRef);

    if (!document.exists()) {
      return { success: false, error: "Quiz result not found" };
    }

    return {
      success: true,
      data: {
        id: document.id,
        ...(document.data() as QuizResult),
      },
    };
  } catch (error) {
    console.error("Error fetching quiz result:", error);
    return { success: false, error: "Failed to fetch quiz result" };
  }
}

export async function getTopUsersByDifficulty(
  difficulty: Difficulty,
  maxResults: number = 10
) {
  try {
    const quizResultsRef = collection(db, "quizResults");
    const q = query(quizResultsRef, where("difficulty", "==", difficulty));

    const querySnapshot = await getDocs(q);

    // Group results by userId and calculate total score
    const userScores = new Map();

    for (const doc of querySnapshot.docs) {
      const data = doc.data() as QuizResult;
      const userId = data.userId;

      if (!userScores.has(userId)) {
        userScores.set(userId, {
          userId,
          totalScore: 0,
          quizCount: 0,
          difficulty,
        });
      }

      const userScore = userScores.get(userId);
      userScore.totalScore += data.score;
      userScore.quizCount += 1;
    }

    // Convert to array and sort by total score
    let leaderboard = Array.from(userScores.values());
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    leaderboard = leaderboard.slice(0, maxResults);

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error("Error fetching top users:", error);
    return { success: false, error: "Failed to fetch top users" };
  }
}

export async function getAverageScore(userId: string, difficulty: Difficulty) {
  try {
    const quizResultsRef = collection(db, "quizResults");
    const q = query(
      quizResultsRef,
      where("difficulty", "==", difficulty),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as QuizResult),
    }));

    if (results.length === 0) {
      return {
        success: true,
        data: {
          averageScore: 0,
          totalQuizzes: 0,
          totalDuration: 0,
          averageDuration: 0,
          highestScore: 0,
          lowestScore: 0,
          totalCorrectAnswers: 0,
          averageCorrectAnswers: 0,
        },
      };
    }

    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const totalDuration = results.reduce((acc, curr) => {
      const start = new Date(curr.startedAt).getTime();
      const end = new Date(curr.completedAt).getTime();
      return acc + (end - start);
    }, 0);

    const totalCorrectAnswers = results.reduce((acc, curr) => {
      return acc + curr.feedback.filter((f) => f.isCorrect).length;
    }, 0);

    const scores = results.map((r) => r.score);

    return {
      success: true,
      data: {
        averageScore: totalScore / results.length,
        totalQuizzes: results.length,
        totalDuration: totalDuration, // in milliseconds
        averageDuration: totalDuration / results.length,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        totalCorrectAnswers,
        averageCorrectAnswers: totalCorrectAnswers / results.length,
      },
    };
  } catch (error) {
    console.error("Error fetching quiz statistics:", error);
    return { success: false, error: "Failed to fetch quiz statistics" };
  }
}
