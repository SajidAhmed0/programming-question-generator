"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LeaderboardEntry } from "@/types/leaderboard";
import { Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
interface TopThreeLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

const TopThreeLeaderboard = ({
  leaderboard,
  loading,
}: TopThreeLeaderboardProps) => {
  const { user } = useAuth();
  // Position colors and styles
  const positionStyles = {
    0: {
      avatarBorder: "border-4 border-first-place",
      rankBg: "bg-first-place",
      crownVisible: true,
      pointsColor: "",
    },
    1: {
      avatarBorder: "border-4 border-second-place",
      rankBg: "bg-second-place",
      crownVisible: false,
      pointsColor: "",
    },
    2: {
      avatarBorder: "border-4 border-third-place",
      rankBg: "bg-third-place",
      crownVisible: false,
      pointsColor: "",
    },
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8">No leaderboard data available</div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center flex-row justify-between">
        {/* Second Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <Avatar className={`h-20 w-20 ${positionStyles[1].avatarBorder}`}>
              <AvatarImage
                src={leaderboard[1]?.photoURL}
                alt={leaderboard[1]?.displayName}
              />
              <AvatarFallback className="text-2xl">
                {leaderboard[1]?.displayName?.substring(0, 2).toUpperCase() ||
                  "-"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 ${positionStyles[1].rankBg} rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold`}
            >
              2
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-sm font-semibold truncate max-w-[150px]">
              {leaderboard[1]?.userId === user?.uid
                ? "You"
                : leaderboard[1]?.displayName || "-"}
            </h3>
            <p
              className={`${positionStyles[1].pointsColor} flex items-center gap-1 text-center mt-1`}
            >
              <Crown className="w-4 h-4 text-second-place fill-second-place" />
              {leaderboard[1]?.totalScore || 0} pts
            </p>
          </div>
        </div>

        {/* First Place */}
        <div className="flex flex-col items-center -mt-12">
          <div className="relative">
            {positionStyles[0].crownVisible && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <Crown className="w-10 h-10 text-first-place fill-first-place" />
              </div>
            )}
            <Avatar className={`h-24 w-24 ${positionStyles[0].avatarBorder}`}>
              <AvatarImage
                src={leaderboard[0]?.photoURL}
                alt={leaderboard[0]?.displayName}
              />
              <AvatarFallback className="text-2xl">
                {leaderboard[0]?.displayName?.substring(0, 2).toUpperCase() ||
                  "-"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 ${positionStyles[0].rankBg} rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold`}
            >
              1
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-sm font-semibold truncate max-w-[150px]">
              {leaderboard[0]?.userId === user?.uid
                ? "You"
                : leaderboard[0]?.displayName || "-"}
            </h3>
            <p
              className={`${positionStyles[0].pointsColor} flex items-center gap-1 text-center mt-1`}
            >
              <Crown className="w-4 h-4 text-first-place fill-first-place" />
              {leaderboard[0]?.totalScore || 0} pts
            </p>
          </div>
        </div>

        {/* Third Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <Avatar className={`h-20 w-20 ${positionStyles[2].avatarBorder}`}>
              <AvatarImage
                src={leaderboard[2]?.photoURL}
                alt={leaderboard[2]?.displayName}
              />
              <AvatarFallback className="text-2xl">
                {leaderboard[2]?.displayName?.substring(0, 2).toUpperCase() ||
                  "-"}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 ${positionStyles[2].rankBg} rounded-full h-8 w-8 flex items-center justify-center text-lg font-bold`}
            >
              3
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-sm font-semibold truncate max-w-[150px]">
              {leaderboard[2]?.userId === user?.uid
                ? "You"
                : leaderboard[2]?.displayName || "-"}
            </h3>
            <p
              className={`${positionStyles[2].pointsColor} flex items-center gap-1 text-center mt-1`}
            >
              <Crown className="w-4 h-4 text-third-place fill-third-place" />
              {leaderboard[2]?.totalScore || 0} pts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopThreeLeaderboard;
