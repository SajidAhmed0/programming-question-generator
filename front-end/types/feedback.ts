export type EvaluateQuizResponse = {
  feedback: QuizFeedback[];
};

export type Feedback = {
  criteria1: string | number;
  criteria2: string | number;
  criteria3: string | number;
};

export type AnswerEvaluation = {
  isCorrect: boolean;
  feedback: Feedback;
  comments: string;
};

export interface QuizFeedback {
  isCorrect: boolean;
  feedback: {
    criteria1: string | number;
    criteria2: string | number;
    criteria3: string | number;
  };
  comments: string;
}
