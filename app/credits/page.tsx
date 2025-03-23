"use client";
import React from "react";
import { motion } from "framer-motion";
import { Github, Code2, Heart } from "lucide-react";
import { TypewriterHero } from "@/components/ui/typewriter-hero";
import { StarryBackground } from "@/components/ui/starry-background";
import { HolographicCard } from "@/components/ui/holographic-card";

const developers = [
  {
    name: "Gopesh Janardhanan",
    role: "Frontend Developer",
    github: "https://github.com/Gopesh456",
    description:
      "A dedicated UI/UX developer with a knack for crafting responsive and visually appealing web applications.",
  },
  {
    name: "Yash Raj",
    role: "Backend Developer",
    github: "https://github.com/ryash072007",
    description:
      "An AI/ML enthusiast with a passion for Python projects and integrating AI into game development using Godot.",
  },
];

function CreditPage() {
  return (
    <div>
      <StarryBackground className="flex flex-col items-center justify-center min-h-screen p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <TypewriterHero
            title="Thank You"
            description="For your participation in the hackathon."
            words={["Participants", "Experts", "Volunteers", "Organizers"]}
            typingSpeed={80}
            deletingSpeed={40}
            pauseDuration={2000}
          />
        </motion.div>
        <div className="flex justify-center w-full">
          <div className="grid w-full max-w-6xl gap-8 md:grid-cols-2 ">
            {developers.map((dev, index) => (
              <HolographicCard
                key={index}
                className="p-8 rounded-xl"
                backgroundColor="#0D0D17"
                darkBackgroundColor="#0A0A14"
                depthEffect={true}
                glowIntensity={1.2}
                shadowColor="rgba(16, 185, 129, 0.25)"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#DAA520]">
                      {dev.name}
                    </h2>
                    <p className="text-gray-400">{dev.role}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Code2 className="w-8 h-8 text-[#DAA520]" />
                  </motion.div>
                </div>
                <p className="mb-6 text-gray-300">{dev.description}</p>
                <motion.a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 transition-colors duration-300 rounded-lg bg-[#303039] hover:bg-[#DAA520]/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-5 h-5 text-white" />
                  <span className="text-white">GitHub Profile</span>
                </motion.a>
              </HolographicCard>
            ))}
          </div>
        </div>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-flex items-center gap-2 text-[#DAA520]"
          >
            <Heart className="w-6 h-6" />
            <span>Made with rigor and passion</span>
          </motion.div>
        </motion.footer>
      </StarryBackground>
    </div>
  );
}

export default CreditPage;
