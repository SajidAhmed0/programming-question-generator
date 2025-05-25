import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getTopUsersByDifficulty } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import useUserStore from "@/store/user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TopThreeLeaderboard from "./TopThreeLeaderboard";
import { LeaderboardEntry } from "@/types/leaderboard";
import { cn } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

const QuizLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { userLevel } = useUserStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user?.uid || !userLevel) return;
      setLoading(true);

      try {
        // Get leaderboard data from server
        const res = await getTopUsersByDifficulty(userLevel, 10);

        if (res.success && res.data) {
          // Enhance leaderboard data with user profiles
          const enhancedLeaderboard = await Promise.all(
            res.data.map(async (entry) => {
              let profile = null;
              const userDoc = await getDoc(doc(db, "users", entry.userId));
              if (userDoc.exists()) {
                profile = {
                  displayName: userDoc.data().name,
                  photoURL:
                    userDoc.data().photoURL || "/images/default-avatar.png",
                };
              }

              return {
                ...entry,
                displayName: profile?.displayName || "Anonymous User",
                photoURL: profile?.photoURL || "/images/default-avatar.png",
              };
            })
          );

          setLeaderboard(enhancedLeaderboard as LeaderboardEntry[]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, userLevel]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quiz Leaderboard (Level: {userLevel})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="flex justify-center py-4">No data available</div>
        ) : (
          <div className="space-y-4">
            <div className="container mx-auto px-4 pt-8 flex-1">
              <div className="mb-12">
                <TopThreeLeaderboard
                  leaderboard={leaderboard}
                  loading={loading}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 container p-4 flex-1 bg-[#E8F2F5] rounded-lg mx-auto">
              {leaderboard.length < 4 ? (
                <div className="text-xs text-center">(No more users)</div>
              ) : (
                leaderboard.slice(3).map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center justify-between bg-white rounded-lg p-2 px-4",
                      entry.userId === user?.uid && "bg-[#64ACF0]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={entry.photoURL}
                          alt={entry.displayName}
                        />
                        <AvatarFallback>
                          {entry.displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {entry.userId === user?.uid
                            ? "You"
                            : entry.displayName}
                        </p>
                        <p
                          className={cn(
                            "text-xs text-muted-foreground",
                            entry.userId === user?.uid && "text-white"
                          )}
                        >
                          {entry.quizCount} quizzes
                        </p>
                      </div>
                    </div>
                    <div className="font-medium">{entry.totalScore} pts</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizLeaderboard;
