"use client";

import { saveUserLevel } from "@/actions/user";
import AssignedLevelModal from "@/components/modals/AssignedLevelModal";
import QuizContent from "@/components/quiz/QuizContent";
import WelcomeCard from "@/components/welcome-quiz/WelcomeCard";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/api-client";
import useQuizStore from "@/store/quiz";
import useUserStore from "@/store/user";
import { ProgrammingQuestion, ExamAndQuestions } from "@/types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const modules = [
  "Object-Oriented Programming - IT2030",
  "Data Structures & Algorithms - IT2070",
  "Object Oriented Concepts - IT1050",
  "Introduction to Programming - IT1010",
  "Internet And Web Technologies - IT1100"
];

const WelcomeProgrammingQuizPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { userLevel, setUserLevel } = useUserStore();
  const router = useRouter();
  const { user } = useAuth();
  const {
    quizQuestions,
    quizAnswers,
    setQuizAnswers,
    setQuizQuestions,
    clearStore,
  } = useQuizStore();

  const handleStartQuiz = async () => {
    if (!selectedModule) {
      toast.error("Please select a module first");
      return;
    }
    
    setIsLoading(true);
    try {
      
      // Pass the selected module to the quiz page via query params
      router.push(`/quiz?module=${encodeURIComponent(selectedModule)}`);
    } catch (error) {
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
      setQuizQuestions([]);
    }
    setIsLoading(false);
  };

  const handleQuizComplete = async (answers: Record<string, string>) => {
    try {
      const res = await apiRequest<ExamAndQuestions>(
        "/api/v1/programming/2/exams/5/answers/",
        "POST",
        { answers }
      );

      setUserLevel(res.data.exam.difficulty);
      await saveUserLevel(user?.uid as string, res.data.exam.difficulty);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error starting the quiz:", error);
    }

    clearStore();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Select Your Module
        </h1>
        
        <div className="grid gap-4 mb-8">
          {modules.map((module) => (
            <div
              key={module}
              onClick={() => setSelectedModule(module)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedModule === module
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <h2 className="text-lg font-medium text-gray-800">
                {module.split(" - ")[0]}
              </h2>
              <p className="text-gray-600">{module.split(" - ")[1]}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleStartQuiz}
            disabled={isLoading || !selectedModule}
            className={`px-6 py-3 rounded-lg text-white font-medium ${
              isLoading || !selectedModule
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            {isLoading ? "Starting..." : "Select the Module"}
          </button>
        </div>
      </div>

      <AssignedLevelModal
        level={userLevel || ""}
        isOpen={isModalOpen}
        handleClose={() => {
          setIsModalOpen(false);
          router.push("/dashboard");
        }}
      />
    </div>
  );
};

export default WelcomeProgrammingQuizPage;

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


// "use client";

// import { saveUserLevel } from "@/actions/user";
// import AssignedLevelModal from "@/components/modals/AssignedLevelModal";
// import QuizContent from "@/components/quiz/QuizContent";
// import WelcomeCard from "@/components/welcome-quiz/WelcomeCard";
// import { useAuth } from "@/context/AuthContext";
// import apiRequest from "@/lib/api-client";
// import useQuizStore from "@/store/quiz";
// import useUserStore from "@/store/user";
// import {
//   ProgrammingQuestion,
//   ExamAndQuestions
// } from "@/types";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import toast from "react-hot-toast";

// const WelcomeProgrammingQuizPage = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { userLevel, setUserLevel } = useUserStore();
//   const router = useRouter();
//   const { user } = useAuth();
//   const {
//     quizQuestions,
//     quizAnswers,
//     setQuizAnswers,
//     setQuizQuestions,
//     clearStore,
//   } = useQuizStore();

//   const handleStartQuiz = async () => {
//     setIsLoading(true);
//     // Need add user id 
//     // const user_id = 2
//     // try {
//     //   const res = await apiRequest<ExamAndQuestions>(
//     //     `/api/v1/programming/${user_id}/exams/`,
//     //     "POST",
//     //     {"module": "Data Structures & Algorithms - IT2070"}
//     //   );
    
//     try {
//       // const res = await apiRequest<ExamAndQuestions>(
//       //   `/api/v1/programming/2/exams/5/`,
//       // );
//       // console.log(res.data)
//       // setQuizQuestions(
//       //   res.data.questions.map((question, i) => ({
//       //     ...question,
//       //     id: i,
//       //     type: question.question_type,
//       //   }))
//       // );
//       router.push('/quiz');
//     } catch (error) {
//       console.error("Error starting the quiz:", error);
//       toast.error("Something went wrong. Please try again.");
//       setQuizQuestions([]);
//     }
//     setIsLoading(false);
//   };

//   const handleQuizComplete = async (answers: Record<string, string>) => {
//     try {
//       const res = await apiRequest<ExamAndQuestions>(
//         "/api/v1/programming/2/exams/5/answers/",
//         "POST",
//         { answers }
//       );

//       setUserLevel(res.data.exam.difficulty);
//       await saveUserLevel(user?.uid as string, res.data.exam.difficulty);
//       setIsModalOpen(true);
//     } catch (error) {
//       console.error("Error starting the quiz:", error);
//     }

//     clearStore();
//   };

//   if (quizQuestions?.length === 0) {
//     return (
//       <div>
//         <WelcomeCard
//           numberOfQuestions={10}
//           includesList={[
//             "Multiple Choice Question Section",
//             "Short answer Questions Section",
//             "Coding question Section",
//           ]}
//           handleStartQuiz={handleStartQuiz}
//           isLoading={isLoading}
//         />
//         <AssignedLevelModal
//           level={userLevel || ""}
//           isOpen={isModalOpen}
//           handleClose={() => {
//             setIsModalOpen(false);
//             router.push("/dashboard");
//           }}
//         />
//       </div>
//     );
//   }

//   return (
//     <QuizContent
//       questions={quizQuestions}
//       answers={quizAnswers}
//       setAnswers={setQuizAnswers}
//       timeLeft={300}
//       onComplete={handleQuizComplete}
//       disableQuestionButtons={true}
//     />
//   );
// };

// export default WelcomeProgrammingQuizPage;
