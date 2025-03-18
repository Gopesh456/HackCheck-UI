"use client";

import React, { useState, useEffect } from "react";

import Navbar from "@/components/navbar"; // Import the Navbar component
import Link from "next/link";
import { fetchData } from "@/utils/api";
// import AcmeLogo from "../components/AcmeLogo";

// Type definition for the question from API
interface Question {
  question: string;
  question_number: number;
  question_id: number;
  status: string;
  score: number;
}

// Type definition for the transformed question to match our UI
interface FormattedQuestion {
  id: number;
  title: string;
  difficulty: string; // This would need to be derived or fetched separately
  Score: number;
  Status: string;
}

const Dashboard = () => {
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            difficulty: getDifficultyLevel(q.question_number),
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
  const getDifficultyLevel = (questionNumber: number): string => {
    // This is a placeholder logic - replace with actual logic based on your requirements
    if (questionNumber % 3 === 0) return "Expert";
    if (questionNumber % 2 === 0) return "Medium";
    return "Easy";
  };

  // Helper function to format status for display
  const formatStatus = (status: string): string => {
    if (status === "NOT_ANSWERED") return "Incomplete";
    if (status === "ANSWERED") return "Complete";
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
            <div className="text-center py-10">Loading questions...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10">No questions available.</div>
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
                    <span className="ml-4">Status: {question.Status}</span>
                  </span>
                </div>
                <Link href={`/question/${question.number}`}>
                  <button className="text-white hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">
                    Solve Challenge
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
