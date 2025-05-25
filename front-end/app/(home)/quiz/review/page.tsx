"use client";

import { getQuizResult } from "@/actions/results";
import { QuizResult } from "@/actions/results";
import QuizContent from "@/components/quiz/QuizContent";
import PageLoader from "@/components/shared/loader";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/api-client";
import { ExamAndQuestions, ProgrammingQuestion, QuestionTypes, QuizFeedback } from "@/types";

const ReviewPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  // const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamAndQuestions | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<ProgrammingQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (user?.uid && id) {
        const exam_id = id;
        const user_id = user?.uid;
        const result = await apiRequest<ExamAndQuestions>(
          `/api/v1/programming/${user_id}/exams/${exam_id}/`,
        );

        if (!result.data) {
          toast.error("Something went wrong");
          return;
        }

        setExamQuestions(result?.data || null);


        const orderedQuestions = [
        ...result?.data.questions.filter((q) => q.question_type === QuestionTypes.MCQ),
        ...result?.data.questions.filter((q) => q.question_type === QuestionTypes.SHORT_ANSWER),
        ...result?.data.questions.filter((q) => q.question_type === QuestionTypes.CODING),
        ];

        setQuizQuestions(
          orderedQuestions?.map((question, i) => ({
            ...question,
            order_id: i,
          }))
        );

        let feedbackes : QuizFeedback[] = []
        let answers : Record<string, string> = {}
        orderedQuestions.forEach((q, i) => {
          feedbackes[i] = {
            "isCorrect": q.is_correct,
            "feedback": {
              "criteria1": "",
              "criteria2": "",
              "criteria3": ""
            },
            "comments": q.answer_feedback
          }
          answers[q.id] = q.student_answer || ""
        });

        setQuizFeedback(feedbackes);
        setQuizAnswers(answers);

        console.log(quizFeedback);
        console.log(quizAnswers);

      };

      
      // if (user?.uid && id) {
      //   const result = await getQuizResult(id);

      //   if (!result.success || !result.data) {
      //     toast.error(result.error || "Something went wrong");
      //     return;
      //   }

      //   setQuizResult(result?.data || null);
      // }
    };
    fetchQuizResult();
  }, [user?.uid, id]);

  if (!examQuestions) {
    return <PageLoader />;
  }

  return (
    <QuizContent
      questions={quizQuestions}
      answers={quizAnswers}
      feedbacks={quizFeedback}
      setAnswers={() => {}}
      onComplete={() => {
        router.back();
      }}
      isReview={true}
      exam={examQuestions.exam}
    />
  );
};
export default ReviewPage;
