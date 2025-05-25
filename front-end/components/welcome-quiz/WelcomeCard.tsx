import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const WelcomeCard = ({
  handleStartQuiz,
  isLoading,
  numberOfQuestions = 10,
  includesList = [
    "Multiple Choice Question Section (06 questions)",
    "Short answer Questions Section (03 questions)",
    "Coding question Section (01 questions)",
  ],
  adaptabilityList,
}: {
  numberOfQuestions?: number;
  includesList?: string[];
  handleStartQuiz?: () => void;
  isLoading?: boolean;
  adaptabilityList?: any[];
}) => {
  return (
    <Card className="w-4/5 mx-auto">
      <CardContent className="flex flex-col gap-8 p-6 px-24">
        <h1 className="text-center text-3xl font-semibold">
          Welcome to Your Programming Question Generation
        </h1>
        <p>
          Welcome! You are about to begin a {numberOfQuestions}-question quiz
          designed to evaluate and assess your Programming proficiency.
          This quiz will help determine your understanding of various aspects of
          the programming with differenct question types, including mcq, short-answer, and coding.
          Whether you're a student seeking targeted practice, the tool provides instant, tailored questions with feedback—helping users strengthen weak areas and progress efficiently. Start generating smart, adaptive programming questions today and enhance your learning experience! 
        </p>
        <p>
          Carefully read the instructions before starting the quiz, as it will
          test your ability to analyze, interpret, and apply your knowledge in
          various contexts. The quiz includes:
        </p>
        {(adaptabilityList?.length == 0) && 
        (
          <div className="mx-auto">
            <p>Instructions</p>
            <ul className="list-disc mx-auto font-semibold">
              {includesList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )
        }

        {(adaptabilityList?.length != 0) && (
          <div className="flex gap-8 mx-auto">
            <div>
              <p>Instructions</p>
              <ul className="list-disc mx-auto font-semibold">
                {includesList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p>Below question topics will be included from previous exam</p>
              <ul className="list-disc mx-auto font-semibold">
                {adaptabilityList?.map((item, i) => (
                  <li key={i}>{item.topic as string} - {item.question_type as string}</li>
                ))}
              </ul>
            </div>
          </div>
      )}

        <Button
          className="w-32 mx-auto"
          onClick={handleStartQuiz}
          disabled={isLoading}
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
