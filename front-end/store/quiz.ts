import { create } from "zustand";
import { ProgrammingQuestion, Exam } from "@/types";
import { persist, createJSONStorage } from "zustand/middleware";

type QuizStore = {
  quizExam: Exam
  quizAnswers: Record<string, string>;
  quizQuestions: ProgrammingQuestion[];
  startedAt: string;
  setQuizAnswers: (newAnswers: Record<string, string>) => void;
  setQuizQuestions: (newQuestions: ProgrammingQuestion[]) => void;
  setQuizExam: (newExam: Exam) => void;
  setStartedAt: (newStartedAt: string) => void;
  clearStore: () => void;
};

const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      quizAnswers: {} as Record<string, string>,
      quizQuestions: [] as ProgrammingQuestion[],
      quizExam: {} as Exam,
      startedAt: "",
      setQuizAnswers: (newAnswers: Record<string, string>) =>
        set({ quizAnswers: newAnswers }),
      setQuizQuestions: (newQuestions: ProgrammingQuestion[]) =>
        set({ quizQuestions: newQuestions }),
      setQuizExam: (newExam: Exam) =>
        set({quizExam: newExam}),
      clearStore: () =>
        set({
          quizQuestions: [],
          quizAnswers: {},
          quizExam: undefined
        }),
      setStartedAt: (newStartedAt: string) => set({ startedAt: newStartedAt }),
    }),
    {
      name: "quiz-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useQuizStore;
