"use client";

import React, { useState, useEffect } from "react";

import Navbar from "@/components/navbar"; // Import the Navbar component
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import router for navigation
import { fetchData } from "@/utils/api";
// import AcmeLogo from "../components/AcmeLogo";

// Type definition for the question from API
interface Question {
  question: string;
  question_number: number;
  question_id: number;
  status: string;
  score: number;
  difficulty: string;
}

// Type definition for the transformed question to match our UI
interface FormattedQuestion {
  id: number;
  title: string;
  difficulty: string; // This would need to be derived or fetched separately
  Score: number;
  Status: string;
  number: number; // Added number property to match what's used in the code
}

const Dashboard = () => {
  const router = useRouter(); // Initialize router
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestion, setLoadingQuestion] = useState<number | null>(null); // Track which question is loading
  const [error, setError] = useState<string | null>(null);

  // Handle solve challenge button click
  const handleSolveChallenge = (questionNumber: number) => {
    setLoadingQuestion(questionNumber); // Set this question as loading
    // Navigate after a brief delay to show loading state
    setTimeout(() => {
      router.push(`/question/${questionNumber}`);
    }, 300);
  };

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetchData("get_questions/", "POST", null);

        // Log the entire response to see its structure

        // Check if response exists
        if (!response) {
          throw new Error("No response received from API");
        }

        // If there's no data property in the response, the response itself might be the data
        const responseData = response.data || response;

        // Check if the questions array exists
        if (!responseData.questions) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        // Map the API response to our UI format
        const formattedQuestions = responseData.questions.map((q: Question) => {
          return {
            number: q.question_number,
            title: q.question,
            difficulty: formatDifficulty(q.difficulty),
            Score: q.score,
            Status: formatStatus(q.status),
          };
        });

        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (err) {
        setError(
          `Failed to load questions: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Helper function to determine difficulty level (you may need to adjust this logic)
  const formatDifficulty = (difficulty: string): string => {
    if (difficulty === "easy") return "Easy";
    if (difficulty === "medium") return "Medium";
    if (difficulty === "hard") return "Expert";
    return difficulty; // Return as is if it's neither
  };

  // Helper function to format status for display
  const formatStatus = (status: string): string => {
    if (status === "NOT_ANSWERED") return "Pending";
    if (status === "CORRECT") return "Correct";
    if (status === "INCORRECT") return "Incorrect";
    return status; // Return as is if it's neither
  };

  return (
    <>
      <div className="bg-[#121418]">
        <Navbar />
        <div className="bg-[#121418] text-white p-5 h-dvh dark px-30">
          <div className="pl-3 text-4xl font-bold border-l-4 dark:text-white border-l-white ">
            Hackathon Questions
          </div>
          <br />

          {loading ? (
            <div className="py-10 text-center">Loading questions...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">{error}</div>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center">No questions available.</div>
          ) : (
            questions.map((question, index) => (
              <div
                key={index}
                className="bg-[#1F202A] rounded-lg p-5 mb-5 shadow-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-2xl font-bold dark:text-white">
                    {question.title}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      question.difficulty.toLowerCase() === "easy"
                        ? "text-[#23D05E]"
                        : question.difficulty.toLowerCase() === "medium"
                        ? "text-[#D05537]"
                        : question.difficulty.toLowerCase() === "expert"
                        ? "text-[#CB3B3F]"
                        : ""
                    }`}
                  >
                    {question.difficulty} &nbsp;
                  </span>
                  <span className="mt-2 text-sm ">
                    <span> Score: {question.Score}</span>
                    <span className="ml-4">Status:</span>
                    <span
                      className={`mt-2 text-sm ${
                        question.Status.toLowerCase() === "correct"
                          ? "text-[#23D05E]"
                          : question.Status.toLowerCase() === "incorrect"
                          ? "text-[#D05537]"
                          : question.Status.toLowerCase() === "pending"
                          ? "text-white"
                          : ""
                      } `}
                    >
                      {" "}
                      {question.Status}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => handleSolveChallenge(question.number)}
                  disabled={loadingQuestion === question.number}
                  className="text-white hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800 disabled:opacity-70"
                >
                  {loadingQuestion === question.number ? (
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    "Solve Challenge"
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
