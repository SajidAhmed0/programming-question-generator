import React, { useEffect, useState } from "react";
import QuizNavigation from "./QuizNavigation";
import QuizQuestion from "./QuizQuestion";
import { Exam, ProgrammingQuestion, QuestionTypes, QuizFeedback } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import PageLoader from "../shared/loader";
import { set } from "date-fns";
interface QuizContentProps {
  timeLeft?: number;
  onComplete: (answers: Record<string, string>) => void;
  disableQuestionButtons?: boolean;
  isReview?: boolean;
  questions: ProgrammingQuestion[];
  answers: Record<string, string>;
  setAnswers?: (answers: Record<string, string>) => void;
  isLoading?: boolean;
  feedbacks?: QuizFeedback[];
  exam: Exam
}

const QuizContent: React.FC<QuizContentProps> = ({
  timeLeft,
  onComplete,
  disableQuestionButtons = false,
  isReview = false,
  questions,
  answers,
  setAnswers,
  isLoading,
  feedbacks,
  exam
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [count, setCount] = useState({
    mcq: 0,
    short_answer: 0,
    coding: 0,
  });

  const handleOptionSelect = (optionId: string) => {
    if (setAnswers) {
      setAnswers({
        ...answers,
        [questions[currentQuestionIndex].id]: optionId,
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      onComplete(answers);
      setShowAnswer(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers[currentQuestion.id];
  const feedback = feedbacks?.[currentQuestionIndex];

  useEffect(() => {
    setCount({
      mcq: questions.filter((q) => q.question_type === QuestionTypes.MCQ).length,
      short_answer: questions.filter((q) => q.question_type === QuestionTypes.SHORT_ANSWER)
        .length,
      coding: questions.filter((q) => q.question_type === QuestionTypes.CODING)
        .length,
    });
  }, [questions]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex gap-6 bg-white rounded-md p-6 shadow-md">
      <QuizNavigation
        currentQuestion={currentQuestionIndex + 1}
        setCurrentQuestion={setCurrentQuestionIndex}
        mcqCount={count.mcq}
        shortAnswerCount={count.short_answer}
        codingCount={count.coding}
        timeLeft={timeLeft}
        onTimeUp={handleNext}
        disableQuestionButtons={disableQuestionButtons}
        onComplete={() => onComplete(answers)}
        questions={questions}
        answers={answers}
        isReview={isReview}
      />

      <div className="flex-1 px-6 py-8 rounded-md border">
        <div className="mb-8 text-sm m-3 p-2 bg-gray-100 rounded-md border">
          <div className="mt-1 flex justify-between">
            <p className="m-2 text-sm font-bold">Topic: {currentQuestion.title}</p>
            <p className="m-2 text-sm font-bold">{exam.module} ({exam.difficulty.toUpperCase()})</p>
            {isReview ? <p className="m-2 text-sm font-bold">Total Marks: {exam.student_marks}({exam.student_marks * 5})/{exam.total_marks}({exam.total_marks * 5})</p> : <p className="m-2 text-sm font-bold">Allocated Marks: {currentQuestion.allocated_marks}</p>}
          </div>
        </div>
        <div className="mx-auto max-w-3xl">
          <QuizQuestion
            question={currentQuestion}
            selectedOption={selectedOption}
            onOptionSelect={handleOptionSelect}
            isReview={isReview}
            feedback={feedback}
          />

          {isReview && ( currentQuestion.question_type != QuestionTypes.MCQ ? (<div className="mt-5 space-y-2 bg-gray-100 p-4 rounded-md">
            <div className="mt-1 flex justify-between">
              <p className="text-sm font-bold">Correct Answer:</p>
              <Button
                onClick={handleShowAnswer}
                className={!showAnswer ? "bg-green-400 hover:bg-green-500" : "bg-red-400 hover:bg-red-500"}
              >
              {showAnswer === false
                ? "Show Answer"
                : "Hide Answer"}
              <ChevronsRight className="w-4 h-4" />
            </Button>
            </div>
            {showAnswer && <p className="text-sm text-gray-500 whitespace-pre font-mono">{currentQuestion.question_type === QuestionTypes.SHORT_ANSWER ? currentQuestion.expected_answers : currentQuestion.code_snippet}</p>}
          </div>) : <div></div>)}

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronsLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedOption && !isReview}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Finish"
                : "Next"}
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default QuizContent;
