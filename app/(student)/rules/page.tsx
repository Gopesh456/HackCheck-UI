"use client";
import React, { useEffect } from "react";
import {
  Code2,
  Clock,
  Trophy,
  Rocket,
  ChevronRight,
  WifiOff,
  CodeSquareIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchData } from "@/utils/api";
import { useState } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator"; // Import LoadingIndicator

function RuleCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 sm:p-6 ${delay} hover:bg-gray-700 transition-all duration-300`}
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4 text-amber-400" />
      <h3 className="mb-2 text-lg sm:text-xl font-bold text-white">{title}</h3>
      <p className="text-sm sm:text-base text-gray-400">{description}</p>
    </div>
  );
}

function RulesPage() {
  const router = useRouter();
  const [error, setError] = useState(""); // Added
  const [loading, setLoading] = useState(true); // Added

  useEffect(() => {
    setLoading(false); // Set loading to false once the component is mounted
  }, []);

  async function handleStart() {
    const response = await fetchData("check_hackathon_status/", "POST", null);
    if (response.has_started === true) {
      router.push("/dashboard");
    } else {
      setError("Hackathon has not started yet");
    }
  }

  if (loading) {
    return <LoadingIndicator fullScreen={true} />; // Show loading indicator
  }

  return (
    <div className="min-h-screen text-white bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-yellow-900/20" />
        <div className="px-4 pt-16 sm:pt-20 pb-12 sm:pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-5xl md:text-6xl font-bold text-transparent fade-in bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              Hackathon Rules
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-400 fade-in-delay-1">
              Welcome to our hackathon! Get ready to innovate, collaborate, and
              create something amazing.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="px-4 py-10 sm:py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: WifiOff,
              title: "Restricted Internet Access",
              description:
                "Internet usage will be limited during this round to ensure fair play.",
              delay: "fade-in-delay-1",
            },
            {
              icon: Clock,
              title: "Strict Time Limit",
              description:
                "Teams have 2 hours to complete all tasks. The session will automatically end after the time is up.",
              delay: "fade-in-delay-2",
            },
            {
              icon: Code2,
              title: "Write Original Code",
              description:
                "All code must be created during the hackathon. Using open-source libraries is allowed.",
              delay: "fade-in-delay-2",
            },
            {
              icon: Trophy,
              title: "Evaluation Criteria",
              description:
                "Teams will be judged based on the number of problems solved and the time taken to complete them.",
              delay: "fade-in-delay-3",
            },
            {
              icon: Rocket,
              title: "Real-Time Leaderboard",
              description:
                "Points for each question will be updated live on the leaderboard.",
              delay: "fade-in-delay-3",
            },
            {
              icon: CodeSquareIcon, // Changed to avoid repeating icons
              title: "Code Submission",
              description:
                "Submit your solutions using the built-in IDE. Winners will be announced after the hackathon ends.",
              delay: "fade-in-delay-3",
            },
          ].map((rule, index) => (
            <RuleCard
              key={index}
              icon={rule.icon}
              title={rule.title}
              description={rule.description}
              delay={rule.delay}
            />
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pb-12 sm:pb-20 text-center">
        <button
          className="px-6 sm:px-8 py-3 sm:py-4 font-bold text-gray-900 transition-all duration-300 transform rounded-full shadow-lg group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:scale-105 hover:shadow-xl animate-float"
          onClick={handleStart}
        >
          Start Coding
          <ChevronRight className="inline-block w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
        <div className="flex justify-center w-full">
          {error && (
            <div className="p-2 mt-4 text-xs sm:text-sm text-white bg-blue-400 border-2 border-blue-700 rounded-lg w-fit">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RulesPage;
