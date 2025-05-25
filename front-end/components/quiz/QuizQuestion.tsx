import React from "react";
import QuizOption from "./QuizOption";
import { ProgrammingQuestion, QuestionTypes, QuizFeedback } from "@/types";
import { RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "../ui/textarea";
import { getOptionIndexByValue } from "@/lib/quiz";

interface QuizQuestionProps {
  question: ProgrammingQuestion;
  selectedOption?: string;
  onOptionSelect: (optionId: string) => void;
  isReview?: boolean;
  feedback?: QuizFeedback;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  onOptionSelect,
  isReview,
  feedback,
}) => {
  return (
    <div className="space-y-6">
      {/* {question?.paragraph && (
        <p className="border rounded-md p-2 text-sm">{question.paragraph}</p>
      )}
      <h3 className="text">
        {question.id + 1}. {question.question?.replaceAll("<blank>", "______")}
      </h3> */}
      <h3 className="text">
        {question.order_id + 1}. {question.description}
      </h3>

      {question.question_type === QuestionTypes.MCQ ? (
        <RadioGroup
          value={selectedOption}
          onValueChange={(value) => onOptionSelect(value)}
        >
          {question.options?.map((option, i) => {
            const isCorrect =
              isReview &&
              (getOptionIndexByValue(question.correct_option as string) === i ||
                question.correct_option === option);
            const isIncorrect =
              isReview &&
              selectedOption === option &&
              (getOptionIndexByValue(question.correct_option as string) !== i ||
                question.correct_option !== option);
            const isSelected = selectedOption === option;

            return (
              <QuizOption
                key={`${question.id}-${i}`}
                option={option}
                isSelected={isSelected}
                isReview={isReview}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
              />
            );
          })}
        </RadioGroup>
      ) : (
        <Textarea
          id={`${question.id}-answer`}
          placeholder="Enter your answer"
          value={selectedOption || ""}
          onChange={(e) => onOptionSelect(e.target.value)}
        />
      )}
      {feedback && (
        <div className="mt-12 space-y-2 bg-gray-100 p-4 rounded-md">
          {feedback.isCorrect ? (
            <div className="flex justify-between">
              <p className="text-sm font-bold text-green-500">
                Your answer is correct
              </p>
              <p>Marks: {question.student_marks}/{question.allocated_marks}</p>
            </div>
          ) : (
            <div className="flex justify-between">
              <p className="text-sm font-bold text-red-500">
                Your answer is incorrect
              </p>
              <p>Marks: {question.student_marks}/{question.allocated_marks}</p>
            </div>
          )}
          {question.question_type != QuestionTypes.MCQ &&
            (<>
              <p className="text-sm font-bold">Comments</p>
              <p className="text-sm text-gray-500">{feedback.comments}</p>
            </>)
          } 
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
