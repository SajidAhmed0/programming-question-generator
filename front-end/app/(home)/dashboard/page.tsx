"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import useUserStore from "@/store/user";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/shared/loader";
import RecentActivities from "@/components/dashboard/RecentActivities";
import QuizLeaderboard from "@/components/dashboard/QuizLeaderboard";
import toast from "react-hot-toast";
import QuizStats from "@/components/dashboard/QuizStats";
import { UserDifficultyType } from "@/types";
import apiRequest from "@/lib/api-client";

const DashboardPage = () => {
  const { user } = useAuth();
  const { userLevel, _hasHydrated } = useUserStore();
  const [moduleStats, setModuleStats] = useState<UserDifficultyType[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   if (_hasHydrated && !userLevel) {
  //     const timer = setTimeout(() => {
  //       toast("Redirecting to welcome quiz...");
  //       router.push("/welcome-programming-quiz");
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [userLevel, router, _hasHydrated]);

  useEffect(() => {
    const fetchModuleStats = async () => {
      let user_id = user?.uid
      const res = await apiRequest<UserDifficultyType[]>(
        `/api/v1/programming/${user_id}/user_difficulties/`,
      );
      console.log("User Difficulty: " + res.data)
      if (res.data) {
        setModuleStats(res.data);
      } else {
        console.error(res);
        setModuleStats([]);
      }
    };
    fetchModuleStats();
    console.log("Out User Difficulty: " + moduleStats)
  }, []);

  if (!_hasHydrated) {
    return <PageLoader />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-2 p-6">
          <CardHeader>
            <CardTitle>Welcome, {user?.displayName} 👋</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-20">
            <div className="flex flex-col flex-1 gap-8">
              <h1 className="text-4xl font-semibold">
                Generate Automated Programming Questions
              </h1>
              <p>
              An innovative platform designed to automatically generate customized programming questions for five key SLIIT modules. Using an intelligent adaptive system, it dynamically adjusts question difficulty based on user performance. Whether you're a student seeking targeted practice, the tool provides instant, tailored questions with feedback—helping users strengthen weak areas and progress efficiently. Start generating smart, adaptive programming questions today and enhance your learning experience! 
              </p>
              
              <Button className="w-fit" onClick={() => router.push("/welcome-programming-quiz")}>
                Select the Programming module
              </Button>
            </div>
            <Image
              src="/images/dashboard.png"
              alt="Quiz"
              width={1000}
              height={1000}
              className="flex-1 object-cover h-72"
            />
          </CardContent>
        </Card>

        {/* <RecentActivities />
        <QuizStats /> */}
      </div>

      <div className="col-span-1 lg:col-span-1">
        {/* <QuizLeaderboard /> */}
        <div className="max-w-md mx-auto font-sans">
  <h3 className="text-xl font-medium text-gray-700 mb-4 pb-1 border-b border-blue-300">
    Programming Modules
  </h3>
  <ul className="space-y-3">
    {/* Module 1 */}
    {
      moduleStats.length > 0 && (
        moduleStats.map((moduleStat) => {
          return (
            <li key={moduleStat.module} className="bg-white p-4 rounded-lg border-l-4 border-blue-400 shadow-sm hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600">{moduleStat.module.slice(0, -9)}</span>
                  <span className="text-gray-500 ml-1 text-sm">{moduleStat.module.slice(-8)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {
                    (moduleStat.difficulty == 'easy') && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {moduleStat.difficulty}
                      </span>
                    )
                  }
                  {
                    (moduleStat.difficulty == 'medium') && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        {moduleStat.difficulty}
                      </span>
                    )
                  }
                  {
                    (moduleStat.difficulty == 'hard') && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        {moduleStat.difficulty}
                      </span>
                    )
                  }
                  <span className="text-sm font-medium text-gray-700">{moduleStat.average}%</span>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${moduleStat.average}%`}}></div>
                </div>
              </div>
            </li>
          )
        })
      )
    }
  </ul>
</div>
      </div>
    </div>
  );
};

export default DashboardPage;
