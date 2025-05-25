"use server";

import { Difficulty, DifficultyLevels } from "@/types";
import { db } from "@/config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function saveUserLevel(userId: string, level: Difficulty) {
  try {
    const userLevelRef = doc(db, "userLevels", userId);
    await setDoc(
      userLevelRef,
      {
        level,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving user level:", error);
    return { success: false, error: "Failed to save user level" };
  }
}

export async function getUserLevel(userId: string) {
  try {
    const userLevelRef = doc(db, "userLevels", userId);
    const document = await getDoc(userLevelRef);

    if (!document.exists()) {
      return { success: true, data: null };
    }

    const data = document.data();
    return {
      success: true,
      data: {
        level: data?.level,
        updatedAt: data?.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error fetching user level:", error);
    return { success: false, error: "Failed to fetch user level" };
  }
}

export async function getUserNameByUid(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().name;
  }
  return null;
}

export async function updateUserLevelBasedOnQuizResult(
  userId: string,
  score: number,
  currentLevel: Difficulty
) {
  const getUpperLevel = (level: Difficulty) => {
    if (level === DifficultyLevels.EASY) return DifficultyLevels.MEDIUM;
    if (level === DifficultyLevels.MEDIUM) return DifficultyLevels.HARD;
    return null;
  };

  const getLowerLevel = (level: Difficulty) => {
    if (level === DifficultyLevels.HARD) return DifficultyLevels.MEDIUM;
    if (level === DifficultyLevels.MEDIUM) return DifficultyLevels.EASY;
    return null;
  };

  try {
    if (score > 15) {
      const newLevel = getUpperLevel(currentLevel);
      if (newLevel) {
        await saveUserLevel(userId, newLevel);
        return newLevel;
      }
    } else if (score < 9) {
      const newLevel = getLowerLevel(currentLevel);
      if (newLevel) {
        await saveUserLevel(userId, newLevel);
        return newLevel;
      }
    }

    return currentLevel;
  } catch (error) {
    console.error("Error updating user level:", error);
  }
}
