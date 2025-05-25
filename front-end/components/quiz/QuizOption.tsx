import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuizOptionProps {
  option: string;
  isSelected: boolean;
  isReview?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}

const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  isSelected,
  isReview,
  isCorrect,
  isIncorrect,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem
        value={option}
        id={option}
        checked={isSelected}
        disabled={isReview}
      />
      <Label
        htmlFor={option}
        className={cn(
          isIncorrect && "text-red-500",
          isCorrect && "text-green-500"
        )}
      >
        {option}
      </Label>
    </div>
  );
};

export default QuizOption;
