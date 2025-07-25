"use client";
import React from "react";
import { Sparkles, Rocket, ChevronRight } from "lucide-react";

import { useRouter } from "next/navigation";

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-2 text-3xl md:text-4xl font-bold text-amber-400">
        {number}
      </div>
      <div className="text-sm md:text-base text-gray-400">{label}</div>
    </div>
  );
}

function LandingPage() {
  const router = useRouter();
  const handleLoginIn = () => {
    router.push("/login");
  };
  return (
    <div className="min-h-screen text-white bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-yellow-600/10 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.1),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.1),_transparent_50%)]" />
        </div>

        <div className="relative px-4 pt-20 md:pt-32 pb-16 md:pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
              <span className="text-sm md:text-base font-medium text-amber-400">
                Bhavans Innovation Challenge
              </span>
            </div>
            <h1 className="mb-6 md:mb-8 text-4xl md:text-6xl lg:text-7xl font-bold text-transparent fade-in bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              Hack the Future
            </h1>
            <p className="max-w-2xl mx-auto mb-8 md:mb-12 text-base md:text-xl text-gray-400 fade-in-delay-1 px-2 sm:px-0">
              Get ready to code, collaborate, and innovate in the Bhavans
              Innovation Challenge! Join us for an exciting journey of
              creativity and problem-solving.
            </p>
            <div className="flex justify-center gap-4 fade-in-delay-2">
              <button
                onClick={handleLoginIn}
                className="px-6 md:px-8 py-3 md:py-4 font-bold text-gray-900 transition-all duration-300 transform rounded-full shadow-lg group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:scale-105 hover:shadow-xl animate-float"
              >
                Login Now
                <ChevronRight className="inline-block w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="inline-flex items-center justify-center fade-in-delay-2 gap-2 px-3 md:px-4 py-1 mb-8 rounded-full bg-amber-400/10 mt-5">
              <Rocket className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
              <span className="text-xs md:text-sm text-amber-400">
                Login with Your Team Name
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 md:py-20 border-t border-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:gap-8 md:grid-cols-4">
            <StatCard number="30+" label="Participants" />
            <StatCard number="10" label="Challenges" />
            <StatCard number="2" label="Rounds" />
            <StatCard number="5h" label="of Innovation" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 md:py-20 bg-gray-800">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center gap-2 px-3 md:px-4 py-1 mb-6 md:mb-8 rounded-full bg-amber-400/10">
            <Rocket className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            <span className="text-xs md:text-sm text-amber-400">
              Login with Your Team Name
            </span>
          </div>
          <h2 className="mb-6 md:mb-8 text-2xl md:text-4xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <button
            onClick={handleLoginIn}
            className="px-6 md:px-8 py-3 md:py-4 font-bold text-gray-900 transition-all duration-300 transform rounded-full shadow-lg group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:scale-105 hover:shadow-xl animate-float"
          >
            Login for the Hackathon
            <ChevronRight className="inline-block w-4 h-4 md:w-5 md:h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
