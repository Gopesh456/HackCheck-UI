"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {Button} from "@/components/ui/button";

const Navbar = () => {
  // Countdown state
  const [time, setTime] = useState(7200); // Set initial countdown time in seconds (e.g., 1 hour)

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formattedTime = new Date(time * 1000).toISOString().substr(11, 8);

  return (
    <nav className="sticky top-0 z-50 w-full p-4 text-white border-b border-gray-800 shadow-lg bg-transperant backdrop-blur-md ">
      <div className="container flex items-center justify-between w-full mx-auto">
        {/* Company Name/Logo */}
        <motion.div whileHover={{ scale: 1.05 }} className="text-2xl font-bold">
          <span className="text-[#d1a214]">Hack</span>
          <span className="text-[#dfcd98]">Check</span>
        </motion.div>

        {/* Timer */}
        <motion.div
          className="text-xl font-mono bg-[#020609] text-[#EAB308] py-2 px-6 rounded-lg border border-gray-700 relative left-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {formattedTime}
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 dark">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/dashboard"
              className="flex items-center text-gray-300 transition-colors hover:text-white"
            >
              <svg
                className="w-5 h-5 mr-1 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                  clipRule="evenodd"
                />
              </svg>

              <span>Home</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/chat"
              className="flex items-center text-gray-300 transition-colors hover:text-white"
            >
              <svg
                className="w-5 h-5 mr-1 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1v2a1 1 0 0 0 1.707.707L9.414 13H15a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8.023 17.215c.033-.03.066-.062.098-.094L10.243 15H15a3 3 0 0 0 3-3V8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1v2a1 1 0 0 1-1.707.707L14.586 18H9a1 1 0 0 1-.977-.785Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Chat</span>
            </Link>
          </motion.div>

          <Button className="flex items-center px-5 font-medium">
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
