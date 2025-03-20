"use client";
import React, { useEffect } from "react";
import {
  Code2,
  Users,
  Clock,
  Trophy,
  Rocket,
  ChevronRight,
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
      className={`bg-gray-800 rounded-xl p-6 ${delay} hover:bg-gray-700 transition-all duration-300`}
    >
      <Icon className="w-8 h-8 mb-4 text-amber-400" />
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
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
        <div className="px-4 pt-20 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold text-transparent md:text-6xl fade-in bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              Hackathon Rules
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-400 fade-in-delay-1">
              Welcome to our hackathon! Get ready to innovate, collaborate, and
              create something amazing.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <RuleCard
            icon={Users}
            title="Team Formation"
            description="Form teams of 2-3 members. Solo participants are also welcome."
            delay="fade-in-delay-1"
          />
          <RuleCard
            icon={Clock}
            title="Time Limit"
            description="3 hours to build your project from scratch. No pre-built solutions allowed."
            delay="fade-in-delay-2"
          />
          <RuleCard
            icon={Code2}
            title="Original Code"
            description="All code must be written during the hackathon. Use of open-source libraries is allowed."
            delay="fade-in-delay-2"
          />
          <RuleCard
            icon={Trophy}
            title="Judging Criteria"
            description="Points will be awarded based on the quality of the code and the time taken."
            delay="fade-in-delay-3"
          />
          <RuleCard
            icon={Rocket}
            title="Submissions"
            description="Submit your code using the built in IDE. Winners will be announced after the hackathon."
            delay="fade-in-delay-3"
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="pb-20 text-center">
        <button
          className="px-8 py-4 font-bold text-gray-900 transition-all duration-300 transform rounded-full shadow-lg group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:scale-105 hover:shadow-xl animate-float"
          onClick={handleStart} // Changed from handleStart() to handleStart
        >
          Start Coding
          <ChevronRight className="inline-block w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
        <div className="flex justify-center w-full">
          {error && (
            <div className="p-2 mt-4 text-sm text-white bg-blue-400 border-2 border-blue-700 rounded-lg w-fit">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RulesPage;
