"use client";
import React from "react";
import { Rocket, ChevronRight } from "lucide-react";
import { useScroll, useTransform } from "motion/react";
import { GoogleGeminiEffect } from "@/components/ui/google-gemini-effect";

import { useRouter } from "next/navigation";

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-2 text-4xl font-bold text-amber-400">{number}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

function LandingPage() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Making the animation more sensitive to scrolling by reducing the end value
  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.3], [0.2, 1.2]);
  const pathLengthSecond = useTransform(
    scrollYProgress,
    [0, 0.25],
    [0.15, 1.2]
  );
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.2], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.15], [0, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.1], [0, 1.2]);

  const router = useRouter();
  const handleLoginIn = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen text-white bg-gray-900" ref={ref}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-yellow-600/10 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.1),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.1),_transparent_50%)]" />
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
        </div>

        <div className="relative px-4 pt-32 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <GoogleGeminiEffect
            pathLengths={[
              pathLengthFirst,
              pathLengthSecond,
              pathLengthThird,
              pathLengthFourth,
              pathLengthFifth,
            ]}
            title="Hack the Future"
            description="Join the most innovative minds in tech for an unforgettable weekend of creation, collaboration, and breakthrough solutions."
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-20 border-t border-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard number="40+" label="Participants" />
            <StatCard number="10" label="Challenges" />
            <StatCard number="2" label="Rounds" />
            <StatCard number="8h" label="of Innovation" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 bg-gray-800">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1 mb-8 rounded-full bg-amber-400/10">
            <Rocket className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400">Login with Your Team Name</span>
          </div>
          <h2 className="mb-8 text-4xl font-bold">
            Ready to Start Your Journey?
          </h2>
          <button
            onClick={handleLoginIn}
            className="px-8 py-4 font-bold text-gray-900 transition-all duration-300 transform rounded-full shadow-lg group bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:scale-105 hover:shadow-xl animate-float"
          >
            Login for the Hackathon
            <ChevronRight className="inline-block w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
