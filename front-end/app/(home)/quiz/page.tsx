"use client";

import { saveQuizResult } from "@/actions/results";
import QuizContent from "@/components/quiz/QuizContent";
import WelcomeCard from "@/components/welcome-quiz/WelcomeCard";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/api-client";
import useQuizStore from "@/store/quiz";
import useUserStore from "@/store/user";
import {
  DifficultyLevel,
  EvaluateQuizResponse,
  ProgrammingQuestion,
  QuestionTypes,
  ExamAndQuestions,
  UserDifficultyType
} from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getQuizTimeSpent } from "@/lib/quiz-utils";
import { updateUserLevelBasedOnQuizResult } from "@/actions/user";
import QuizStats from "@/components/dashboard/QuizStats";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

const QuizPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [module, setModule] = useState('');
  const [userDifficulty, setUserDifficulty] = useState<UserDifficultyType | null>(null);
  const {
    quizQuestions,
    quizAnswers,
    quizExam,
    setQuizExam,
    setQuizQuestions,
    setQuizAnswers,
    startedAt,
    setStartedAt,
    clearStore,
  } = useQuizStore();
  const { userLevel, setUserLevel } = useUserStore();
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const user_id = user?.uid;
    setModule(searchParams.get('module') as string);
    console.log(module);

    const getUserDifficulty = async () => {
      const res = await apiRequest<UserDifficultyType>(
        `/api/v1/programming/${user_id}/user_difficulties/`,
        "POST",
        {"module": module}
      );
      
      if (res.data) {
        setUserDifficulty(res.data);
      } else {
        console.error(res);
        setUserDifficulty(null);
      }
    }
    getUserDifficulty();
  }, [module])

  const handleStartQuiz = async () => {
    setIsLoading(true);
    const user_id = user?.uid
    // Need add user id 
    // try {
    //   const res = await apiRequest<ExamAndQuestions>(
    //     `/api/v1/programming/${user_id}/exams/`,
    //     "POST",
    //     {"module": module}
    //   );
    try {
      console.log("inside try");
      const res = await apiRequest<ExamAndQuestions>(
        `/api/v1/programming/${user_id}/exams/31/`,
      );

      const questions = res.data.questions;
      const exam = res.data.exam;

      const orderedQuestions = [
        ...questions.filter((q) => q.question_type === QuestionTypes.MCQ),
        ...questions.filter((q) => q.question_type === QuestionTypes.SHORT_ANSWER),
        ...questions.filter((q) => q.question_type === QuestionTypes.CODING),
      ];

      console.log(questions);
      console.log(exam);

      setQuizExam(exam);

      setQuizQuestions(
        orderedQuestions?.map((question, i) => ({
          ...question,
          order_id: i,
        }))
      );
      setStartedAt(new Date().toISOString());
      console.log(quizExam);
      console.log(quizQuestions);
    } catch (error) {
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
      setQuizQuestions([]);
    }
    setIsLoading(false);
  };
  const handleCompletedExams = () => {
    router.push(`/programming-exams?module=${encodeURIComponent(module)}`);
  }

  const handleBack = () => {
    router.push(`/welcome-programming-quiz`);
  }

  const handleQuizComplete = async (answers: Record<string, string>) => {
    setIsLoading(true);
    const answersArray = Array.from(
      { length: 20 },
      (_, i) => answers[i] || "<no answer provided>"
    );

    console.log("inside quiz complete");
    console.log(quizExam);
    console.log(quizQuestions);
    console.log(quizAnswers);

    try {
      quizQuestions.forEach(question => {
        question.student_answer = quizAnswers[question.id];
        question.answered = true;
      });
      quizExam.status = true;
      quizExam.completed_at = new Date().toISOString();
      console.log(quizQuestions);
      
      const completedAt = new Date();

      let exam_id = quizExam.id
      let user_id = user?.uid

      const res = await apiRequest<ExamAndQuestions>(
        `/api/v1/programming/${user_id}/exams/${exam_id}/`,
      );

      //real
      // const res = await apiRequest<ExamAndQuestions>(
      //   `/api/v1/programming/${user_id}/exams/${exam_id}/answers/`,
      //   "POST",
      //   {
      //     exam: quizExam,
      //     questions: quizQuestions,
      //   }
      // );


      // const res = await apiRequest<EvaluateQuizResponse>(
      //   "/api/english/evaluate-quiz",
      //   "POST",
      //   {
      //     questions: quizQuestions,
      //     answers: answersArray,
      //   }
      // );

      console.log(res.data);

      // clearStore(); // TODO:need to delete 

      const resultExam = res.data?.exam;
      const resultQuestions = res.data?.questions;

      const newLevel = resultExam.difficulty

      // if (newLevel && newLevel !== userLevel) {
      //   setUserLevel(newLevel);
      //   toast.success(`Your level has been updated to ${newLevel}`);
      // }

      if (user?.uid) {
        // const savedResult = await saveQuizResult({
        //   userId: user?.uid,
        //   score: correctAnswers.length,
        //   difficulty: userLevel,
        //   timeSpent: getQuizTimeSpent(startedAt, completedAt.toISOString()),
        //   completedAt: completedAt.toISOString(),
        //   startedAt: startedAt,
        //   answers: answers,
        //   feedback: evaluations,
        //   questions: quizQuestions,
        // });

        toast.success("Quiz completed successfully");
        clearStore();
        router.push(`/quiz/result?id=${resultExam.id}`);

      // const evaluations = res.data?.feedback;
      // const correctAnswers = evaluations.filter((e) => e.isCorrect);

      // const newLevel = await updateUserLevelBasedOnQuizResult(
      //   user?.uid as string,
      //   correctAnswers.length,
      //   userLevel as DifficultyLevel
      // );

      // if (newLevel && newLevel !== userLevel) {
      //   setUserLevel(newLevel);
      //   toast.success(`Your level has been updated to ${newLevel}`);
      // }

      // if (user?.uid && userLevel) {
      //   const savedResult = await saveQuizResult({
      //     userId: user?.uid,
      //     score: correctAnswers.length,
      //     difficulty: userLevel,
      //     timeSpent: getQuizTimeSpent(startedAt, completedAt.toISOString()),
      //     completedAt: completedAt.toISOString(),
      //     startedAt: startedAt,
      //     answers: answers,
      //     feedback: evaluations,
      //     questions: quizQuestions,
      //   });

      //   toast.success("Quiz completed successfully");
      //   clearStore();
      //   router.push(`/quiz/result?id=${savedResult.id}`);
      }
    } catch (error) {
      console.error("Error completing the quiz:", error);
    }
    setIsLoading(false);
  };

  if (quizQuestions?.length === 0) {
    return (
      <div>
        <div className="flex justify-between mb-4 text-lg p-2 bg-gray-300 rounded-md border">
            <Button
              onClick={handleBack}
              className="ml-4 mt-auto mb-auto"
            >
              <ChevronsLeft className="w-4 h-4" />
              {"Back"}
            </Button>
            <p className="p-3 text-lg font-bold">{module}</p>
            <Button
              onClick={handleCompletedExams}
              className="mr-4 mt-auto mb-auto"
            >
              {"Completed Exams"}
              <ChevronsRight className="w-4 h-4" />
            </Button>
        </div>
        <div className="flex flex-row gap-6">
          <WelcomeCard handleStartQuiz={handleStartQuiz} isLoading={isLoading} adaptabilityList={userDifficulty ? userDifficulty.adaptability : []} />
          <QuizStats />
        </div>
      </div>
    );
  }

  return (
    <QuizContent
      questions={quizQuestions}
      answers={quizAnswers}
      setAnswers={setQuizAnswers}
      timeLeft={quizQuestions.length * 120}
      onComplete={handleQuizComplete}
      isLoading={isLoading}
      exam={quizExam}
    />
  );
};

export default QuizPage;
