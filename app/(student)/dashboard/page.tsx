"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Import motion from framer-motion

import Navbar from "@/components/navbar"; // Import the Navbar component
import { useRouter } from "next/navigation"; // Import router for navigation
import { fetchData } from "@/utils/api";

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

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for each item
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.3)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Page animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
      },
    },
  };

  // Header animation variants
  const headerVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  // Content container animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="h-full w-full bg-[#121418]"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <Navbar />
      <div className="bg-[#121418] text-white p-3 sm:p-5 h-full dark px-4 sm:px-8 md:px-16 lg:px-30">
        <motion.div
          className="pl-3 text-2xl sm:text-3xl md:text-4xl font-bold border-l-4 dark:text-white border-l-white"
          variants={headerVariants}
        >
          Hackathon Questions
        </motion.div>
        <br />

        <motion.div variants={contentVariants}>
          {loading ? (
            <motion.div
              className="py-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Loading questions...
            </motion.div>
          ) : error ? (
            <motion.div
              className="py-10 text-center text-red-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          ) : questions.length === 0 ? (
            <motion.div
              className="py-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No questions available.
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {questions.map((question, index) => (
                <motion.div
                  key={index}
                  className="bg-[#1F202A] rounded-lg p-4 sm:p-5 mb-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between"
                  variants={itemVariants}
                  whileHover="hover"
                  layout
                >
                  <div className="mb-4 sm:mb-0">
                    <div className="text-xl sm:text-2xl font-bold dark:text-white">
                      {question.title}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span
                        className={`${
                          question.difficulty.toLowerCase() === "easy"
                            ? "text-[#23D05E]"
                            : question.difficulty.toLowerCase() === "medium"
                            ? "text-[#D05537]"
                            : question.difficulty.toLowerCase() === "expert"
                            ? "text-[#CB3B3F]"
                            : ""
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      <span className="mx-2">•</span>
                      <span> Score: {question.Score}</span>
                      <span className="mx-2">•</span>
                      <span>Status:</span>
                      <span
                        className={`${
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
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleSolveChallenge(question.number)}
                    disabled={
                      loadingQuestion === question.number ||
                      question.Status.toLowerCase() === "correct"
                    }
                    className={`text-white border rounded-lg text-sm px-4 sm:px-5 py-2 sm:py-2.5 text-center w-full sm:w-auto ${
                      question.Status.toLowerCase() === "correct"
                        ? "border-white cursor-default"
                        : "border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
                    } disabled:opacity-70`}
                    whileHover={
                      question.Status.toLowerCase() !== "correct"
                        ? { scale: 1.05 }
                        : {}
                    }
                    whileTap={
                      question.Status.toLowerCase() !== "correct"
                        ? { scale: 0.95 }
                        : {}
                    }
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
                    ) : question.Status.toLowerCase() === "correct" ? (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 -ml-1 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Solved
                      </div>
                    ) : (
                      "Solve Challenge"
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
