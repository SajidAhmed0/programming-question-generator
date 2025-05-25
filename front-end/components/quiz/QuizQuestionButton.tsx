import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import React from "react";

export enum QuizQuestionButtonType {
  CORRECT = "correct",
  INCORRECT = "incorrect",
}

interface QuizQuestionButtonProps {
  questionNumber: number;
  type?: QuizQuestionButtonType;
  isCurrent?: boolean;
  isAnswered?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const QuizQuestionButton = ({
  questionNumber,
  type,
  isCurrent = false,
  isAnswered = false,
  onClick,
  disabled = false,
}: QuizQuestionButtonProps) => {
  return (
    <div
      className={cn(
        "border-2 border-gray-400 rounded w-10 flex flex-col justify-between cursor-pointer",
        isCurrent && "shadow-md shadow-blue-500",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && onClick()}
    >
      <div className="flex items-center justify-center h-7">
        <p>{questionNumber}</p>
      </div>
      <div
        className={cn(
          "w-full h-4 rounded-b-xs flex items-center justify-center bg-transparent",
          isAnswered && "bg-gray-400",
          type === QuizQuestionButtonType.CORRECT && "bg-green-500",
          type === QuizQuestionButtonType.INCORRECT && "bg-red-500"
        )}
      >
        {type === QuizQuestionButtonType.CORRECT && (
          <Check className="w-3 h-3 text-white" />
        )}
        {type === QuizQuestionButtonType.INCORRECT && (
          <X className="w-3 h-3 text-white" />
        )}
      </div>
    </div>
  );
};

export default QuizQuestionButton;
