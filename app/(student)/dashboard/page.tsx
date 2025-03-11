"use client";

import React from "react";

import Navbar from "@/components/navbar"; // Import the Navbar component
import Link from "next/link";

// import AcmeLogo from "../components/AcmeLogo";

const questions = [
  {
    id: 1,
    title: "Correlation and Regression Lines - A Quick Recap #1",
    difficulty: "Medium",
    Score: 0,
    Status: "Incomplete",
  },
  {
    id: 2,
    title: "Day 6: Multiple Linear Regression: Predicting House Prices",
    difficulty: "Expert",
    Score: 0,
    Status: "Incomplete",
  },
  {
    id: 3,
    title: "Correlation and Regression Lines - A Quick Recap #2",
    difficulty: "Medium",
    Score: 0,
    Status: "Incomplete",
  },
  {
    id: 4,
    title: "Polynomial Regression: Office Prices",
    difficulty: "Easy",
    Score: 0,
    Status: "Incomplete",
  },
];

const Dashboard = () => {
  return (
    <>
      <div className="bg-[#121418]">
        <Navbar />
        <div className="bg-[#121418] text-white p-5 h-dvh dark px-30">
          <div className="pl-3 text-4xl font-bold border-l-4 dark:text-white border-l-white ">
            Hackathon Questions
          </div>
          <br />

          {questions.map((question, index) => (
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
              <Link href={`/question/${question.id}`}>
                <button className="text-white hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300   rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">
                  Solve Challenge
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
