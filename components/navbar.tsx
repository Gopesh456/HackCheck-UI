"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaHome, FaComments, FaSignOutAlt } from "react-icons/fa";

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
    <nav className="bg-[#121418] text-white p-4 shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        {/* Company Name/Logo */}
        <motion.div whileHover={{ scale: 1.05 }} className="text-2xl font-bold">
          <span className="text-[#d1a214]">Hack</span>
          <span className="text-[#dfcd98]">Athon</span>
        </motion.div>

        {/* Timer */}
        <motion.div
          className="text-xl font-mono bg-[#1F202A] text-[#EAB308] py-2 px-6 rounded-lg border border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {formattedTime}
        </motion.div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/chat"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <FaComments className="mr-1" />
              <span>Chat</span>
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center text-gray-300 hover:text-red-400 transition-colors"
          >
            <FaSignOutAlt className="mr-1" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
