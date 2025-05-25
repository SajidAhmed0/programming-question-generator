import { getAverageScore } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import useUserStore from "@/store/user";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { QuizStatsType } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import apiRequest from "@/lib/api-client";

const QuizStats = () => {
  const { user } = useAuth();
  const [quizStats, setQuizStats] = useState<QuizStatsType | null>(null);
  const { userLevel } = useUserStore();
  const [module, setModule] = useState('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchAverageScore = async () => {
      setModule(searchParams.get('module') as string);
      console.log("Quiz state: " + module);
      if (!user?.uid) return;
      let user_id = user?.uid
      const res = await apiRequest<QuizStatsType>(
        `/api/v1/programming/${user_id}/exam_statics`,
        "POST",
        {"module": module}
      );
      if (res.data) {
        setQuizStats(res.data);
      } else {
        console.error(res);
        setQuizStats(null);
      }
    };
    fetchAverageScore();
  }, [user?.uid, module]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {quizStats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">
                {quizStats.average.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-2xl font-bold">{quizStats.total_exams}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">
                {quizStats.highest_marks * 5}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600">
                {quizStats.lowest_marks * 5}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold">{quizStats.difficulty.toUpperCase()}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Correct MCQ Count</p>
              <p className="text-2xl font-bold">
                {quizStats.total_correct_mcq} / {quizStats.total_mcq}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Correct Short-Answer Count</p>
              <p className="text-2xl font-bold">
                {quizStats.total_correct_short_answer} / {quizStats.total_short_answer}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">
                Correct Coding Count
              </p>
              <p className="text-2xl font-bold">
                {quizStats.total_correct_coding} / {quizStats.total_coding}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-4 text-muted-foreground">
            No quiz data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizStats;
