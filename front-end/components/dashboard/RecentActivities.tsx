import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getRecentQuizzes, QuizResult } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { format } from "date-fns";
import { getQuizMarks } from "@/lib/quiz-utils";

const RecentActivities = () => {
  const [recentActivities, setRecentActivities] = useState<
    (QuizResult & { id: string })[]
  >([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user?.uid) return;
      const res = await getRecentQuizzes(user?.uid, 6);

      if (res.success && res.data) {
        setRecentActivities(res.data);
      } else {
        setRecentActivities([]);
      }
    };
    fetchRecentActivities();
  }, [user?.uid]);

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {recentActivities.length === 0 ? (
            <div className="flex justify-center py-4">No data available</div>
          ) : (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 text-sm"
              >
                <Image
                  src={"/images/quiz.png"}
                  alt="quiz"
                  width={50}
                  height={50}
                />
                <div>
                  <p className="font-semibold">Quiz</p>
                  <p>Marks: {getQuizMarks(activity.feedback)}</p>
                </div>
                <div className="text-right flex-1">
                  <p className="text-muted-foreground text-xs">
                    {activity.completedAt &&
                      format(new Date(activity.completedAt), "PPP")}{" "}
                    •{" "}
                    {activity.completedAt &&
                      format(new Date(activity.completedAt), "p")}
                  </p>
                  <p>
                    Difficulty:{" "}
                    <span className="font-semibold">{activity.difficulty}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
