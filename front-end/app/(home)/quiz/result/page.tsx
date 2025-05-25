"use client";

import React, { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getQuizResult } from "@/actions/results";
import { QuizResult } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoader from "@/components/shared/loader";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { getQuizGrade, getQuizMarks } from "@/lib/quiz-utils";
import { Button } from "@/components/ui/button";
import ShareResultsModal from "@/components/modals/ShareResultsModal";
import { ExamAndQuestions } from "@/types";
import apiRequest from "@/lib/api-client";

const QuizResultPage = () => {
  const router = useRouter();
  // const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamAndQuestions | null>(null);
  const [tableData, setTableData] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  // exam id
  const id = searchParams.get("id");

  function getDuration(created_at : string, completed_at : string) {
    // Convert inputs to timestamps (handles ISO strings, Date objects, or numbers)
    const startTime = new Date(created_at).getTime();
    const endTime = new Date(completed_at).getTime();
  
    // Calculate difference in milliseconds
    const diffMs = endTime - startTime;
  
    // Handle negative differences (if completed_at is before created_at)
    const absDiffMs = Math.abs(diffMs);
  
    // Calculate time components
    const seconds = Math.floor(absDiffMs / 1000) % 60;
    const minutes = Math.floor(absDiffMs / (1000 * 60)) % 60;
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  
    // Build human-readable parts
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
  
    // Handle zero duration (e.g., "0s")
    const formattedDuration = parts.length > 0 ? parts.join(' ') : '0s';
  
    // Add negative sign if end time is before start time
    return diffMs < 0 ? `-${formattedDuration}` : formattedDuration;
  }

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (id) {
        const user_id = user?.uid;
        
        const result = await apiRequest<ExamAndQuestions>(
          `/api/v1/programming/${user_id}/exams/${id}/`,
        );

        if (!result.data) {
          toast.error("Something went wrong");
          return;
        }

        const data = result.data;
        setExamQuestions(data);
        setTableData([
          { label: "Exam ID", value: data?.exam.id.toString() },
          { label: "Status", value: "Finished" },
          {
            label: "Started",
            value: data?.exam.created_at
              ? format(data?.exam.created_at, "EEEE, d MMMM yyyy, h.mm a")
              : "--",
          },
          {
            label: "Completed",
            value: data?.exam.completed_at
              ? format(data?.exam.completed_at, "EEEE, d MMMM yyyy, h.mm a")
              : "--",
          },
          // { label: "Duration", value: data?.timeSpent.toString() || "0" },
          { label: "Duration", value: getDuration(data?.exam.created_at, data?.exam.completed_at) || "0" },
          { label: "Module", value: data?.exam.module },
          { label: "Marks", value: `${data?.exam.student_marks} / ${data?.exam.total_marks}` },
          { label: "Percentage", value: `${data?.exam.student_marks * 5}%` },
          { label: "Difficulty", value: data?.exam.difficulty },
        ]);
      }  
      // if (id) {
      //   const result = await getQuizResult(id);

      //   if (!result.success || !result.data) {
      //     toast.error(result.error || "Something went wrong");
      //     return;
      //   }

      //   const data = result.data;
      //   setQuizResult(data);
      //   setTableData([
      //     { label: "Status", value: "Finished" },
      //     {
      //       label: "Started",
      //       value: data?.startedAt
      //         ? format(data?.startedAt, "EEEE, d MMMM yyyy, h.mm a")
      //         : "--",
      //     },
      //     {
      //       label: "Completed",
      //       value: data?.completedAt
      //         ? format(data?.completedAt, "EEEE, d MMMM yyyy, h.mm a")
      //         : "--",
      //     },
      //     { label: "Duration", value: data?.timeSpent.toString() || "0" },
      //     { label: "Marks", value: getQuizMarks(data?.feedback || []) },
      //     { label: "Grade", value: getQuizGrade(data?.feedback || []) },
      //     { label: "Difficulty", value: data?.difficulty },
      //   ]);
      // }
    };
    fetchQuizResult();
  }, [id]);

  if (!examQuestions) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-2xl p-12">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-medium">
            Quiz Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-lg">
            <div className="bg-background overflow-hidden rounded-md border">
              <Table>
                <TableBody>
                  {tableData.map((item) => (
                    <TableRow
                      key={item.label}
                      className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r"
                    >
                      <TableCell className="bg-muted/50 py-2 font-medium text-right">
                        {item.label}
                      </TableCell>
                      <TableCell className="py-2 bg-white">
                        {item.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* {examQuestions.exam.user_id && ( */}
            {examQuestions.exam.user_id === user?.uid && (
              <div className="flex justify-center items-center mt-8 gap-4 w-sm mx-auto">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => router.push(`/quiz/review?id=${id}`)}
                >
                  Review Answers
                </Button>
                <ShareResultsModal />
                <Button
                  className="flex-1"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResultPage;
