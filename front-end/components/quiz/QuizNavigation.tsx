import React, { memo } from "react";
import QuizTimer from "./QuizTimer";
import QuizQuestionButton from "./QuizQuestionButton";
import { ProgrammingQuestion } from "@/types";
import { Button } from "../ui/button";

interface QuestionSectionProps {
  title: string;
  count: number;
  startIndex: number;
  currentQuestion: number;
  setCurrentQuestion: (question: number) => void;
  disableQuestionButtons?: boolean;
  questions: ProgrammingQuestion[];
  answers: Record<string, string>;
}

const QuestionSection = memo(
  ({
    title,
    count,
    startIndex,
    currentQuestion,
    setCurrentQuestion,
    disableQuestionButtons = false,
    questions,
    answers,
  }: QuestionSectionProps) => {
    if (count === 0) return null;

    return (
      <>
        <p className="text-sm font-medium text-muted-foreground mb-2 mt-4">
          {title}
        </p>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: count }).map((_, index) => (
            <QuizQuestionButton
              key={index}
              questionNumber={startIndex + index + 1}
              isCurrent={currentQuestion === startIndex + index + 1}
              onClick={() => setCurrentQuestion(startIndex + index)}
              disabled={disableQuestionButtons}
              isAnswered={!!answers[questions[startIndex + index].id]}
            />
          ))}
        </div>
      </>
    );
  }
);

QuestionSection.displayName = "QuestionSection";

interface QuizNavigationProps {
  currentQuestion: number;
  setCurrentQuestion: (question: number) => void;
  mcqCount?: number;
  shortAnswerCount?: number;
  codingCount?: number;
  timeLeft?: number;
  onTimeUp?: () => void;
  disableQuestionButtons?: boolean;
  onComplete?: () => void;
  questions: ProgrammingQuestion[];
  answers: Record<string, string>;
  isReview?: boolean;
}

const QuizNavigation = memo(
  ({
    currentQuestion,
    setCurrentQuestion,
    mcqCount = 0,
    shortAnswerCount = 0,
    codingCount = 0,
    timeLeft,
    onTimeUp,
    disableQuestionButtons = false,
    onComplete,
    questions,
    answers,
    isReview = false,
  }: QuizNavigationProps) => {
    return (
      <div className="border rounded-md px-6 py-4">
        <p>Quiz Navigation</p>

        <QuestionSection
          title="MCQ"
          count={mcqCount}
          startIndex={0}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          disableQuestionButtons={disableQuestionButtons}
          questions={questions}
          answers={answers}
        />

        <QuestionSection
          title="Short Answer"
          count={shortAnswerCount}
          startIndex={mcqCount}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          disableQuestionButtons={disableQuestionButtons}
          questions={questions}
          answers={answers}
        />

        <QuestionSection
          title="Coding"
          count={codingCount}
          startIndex={mcqCount + shortAnswerCount}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          disableQuestionButtons={disableQuestionButtons}
          questions={questions}
          answers={answers}
        />

        {onComplete && (
          <div className="mt-4">
            <Button variant="link" className="p-0" onClick={onComplete}>
              {isReview ? "Finish review" : "Finish attempt..."}
            </Button>
          </div>
        )}

        {timeLeft && onTimeUp && (
          <div className="">
            <QuizTimer duration={timeLeft} onTimeUp={onTimeUp} />
          </div>
        )}
      </div>
    );
  }
);

QuizNavigation.displayName = "QuizNavigation";

export default QuizNavigation;
