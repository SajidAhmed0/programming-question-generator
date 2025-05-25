export * from "./feedback";

type ProgrammingLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'php';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
type QuestionType = 'mcq' | 'short-answer' | 'coding';

export type ProgrammingQuestion = {
  order_id: number;
  id: number;
  title: string;
  description: string;
  language: ProgrammingLanguage;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  code_snippet?: string | null;
  options?: any[] | null; // Using any[] since it's JSONField, you might want to specify a more precise type
  correct_option?: string | null;
  expected_output?: string | null;
  expected_answers?: any[] | null; // Using any[] for JSONField
  validated: boolean;
  retry_count: number;
  last_failure_reason?: string | null;
  created_at: string; // DateTime in Django becomes string in TypeScript (ISO format)
  updated_at: string;
  user_id: string;
  module?: string | null;
  exam_id: string;
  allocated_marks: number;
  student_marks: number;
  student_answer?: string | null;
  answered: boolean;
  is_correct: boolean;
  answer_feedback: string;
};

export type Exam = {
  id: number; // Implicit in Django but we'll include it
  created_at: string; // DateTime as ISO string
  completed_at: string;
  user_id: string;
  module: string;
  status: boolean;
  total_marks: number;
  student_marks: number;
  difficulty: DifficultyLevel;
};

export type QuizStatsType = {
  average: number; // Implicit in Django but we'll include it
  difficulty: DifficultyLevel; // DateTime as ISO string
  total_exams: number;
  highest_marks: number;
  lowest_marks: number;
  total_mcq: number;
  total_correct_mcq: number;
  total_short_answer: number;
  total_correct_short_answer: number;
  total_coding: number;
  total_correct_coding: number;
};

export type UserDifficultyType = {
  average: number; // Implicit in Django but we'll include it
  difficulty: DifficultyLevel; // DateTime as ISO string
  user_id: string;
  module: string;
  adaptability : any[];
};

export type ExamAndQuestions = {
  exam: Exam;
  questions: ProgrammingQuestion[];
}

export type UserDifficulty = {
  id: number; // Implicit primary key in Django
  user_id: string;
  difficulty: DifficultyLevel;
  module: string;
  average?: number | null; // DecimalField becomes number in TS, optional due to blank/null
  adaptability: any[]; // JSONField default=list, use more specific type if known
};

// export type Difficulty = "Easy" | "Medium" | "Hard";
export enum DifficultyLevels {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum QuestionTypes {
  MCQ = "mcq",
  SHORT_ANSWER = "short-answer",
  CODING = "coding",
}

// type Question = {
//   id: number;
//   question: string;
//   answer: string;
//   type: QuestionType;
//   paragraph?: string;
// };

// export type DifficultyQuestion = Question & {
//   options: string[];
//   difficulty: Difficulty;
//   type: QuestionType.DIFFICULTY;
// };

// export type McqQuestion = Question & {
//   options: string[];
//   type: QuestionType.MCQ;
// };

// export type ShortAnswerQuestion = Question & {
//   options: string[];
//   type: QuestionType.SHORT_ANSWER;
// };

// export type CodingQuestion = Question & {
//   answer: string;
//   type: QuestionType.CODING;
// };

// export type AnyQuestion =
//   | DifficultyQuestion
//   | McqQuestion
//   | ShortAnswerQuestion
//   | CodingQuestion;

// export type DifficultyTestResponse = {
//   test_questions: DifficultyQuestion[];
// };

// export type EvaluateDifficultyTestResponse = {
//   difficulty_level: Difficulty;
// };

// export type GenerateQuizResponse = {
//   quiz_questions: [
//     (McqQuestion | ShortAnswerQuestion | CodingQuestion)[],
//     string[]
//   ];
// };

// export type QuizStatsType = {
//   averageScore: number;
//   totalQuizzes: number;
//   totalDuration: number;
//   averageDuration: number;
//   highestScore: number;
//   lowestScore: number;
//   totalCorrectAnswers: number;
//   averageCorrectAnswers: number;
// };
