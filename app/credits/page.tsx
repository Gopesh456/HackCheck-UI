"use client";
import React from "react";
import { motion } from "framer-motion";
import { Github, Code2, Heart } from "lucide-react";

const developers = [
  {
    name: "Gopesh Janardhanan",
    role: "Frontend Developer",
    github: "https://github.com/Gopesh456",
    description:
      "UI/UX specialist with a passion for creating beautiful, responsive web applications",
  },
  {
    name: "Yash Raj",
    role: "Backend Developer",
    github: "https://github.com/ryash072007",
    description:
      "AI/ML enthusiast passionate about Python projects and AI integration in Godot",
  },
];

function CreditPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-white bg-[#1A1A1A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16 text-center"
      >
        <motion.h1
          className="mb-4 text-6xl font-bold text-transparent bg-gradient-to-r from-[#FFD700] via-[#DAA520] to-[#B8860B] bg-clip-text"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Thank You
        </motion.h1>
        <p className="text-xl text-gray-300">For being part of our journey</p>
      </motion.div>

      <div className="grid w-full max-w-6xl gap-8 md:grid-cols-2">
        {developers.map((dev, index) => (
          <motion.div
            key={dev.name}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="p-8 transition-shadow duration-300 shadow-xl bg-[#2A2A2A] rounded-xl hover:shadow-[#DAA520]/20"
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
              className="inline-flex items-center gap-2 px-4 py-2 transition-colors duration-300 rounded-lg bg-[#121212] hover:bg-[#DAA520]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
              <span>GitHub Profile</span>
            </motion.a>
          </motion.div>
        ))}
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
    </div>
  );
}

export default CreditPage;
