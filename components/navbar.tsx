"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  // Countdown state
  const [time, setTime] = useState(0); // Set initial countdown time in seconds (e.g., 1 hour)
  async function getTime() {
    try {
      const response = await fetchData("get_time_left/", "POST", null);
      if (response.time_left !== undefined) {
        setTime(response.time_left);
      }
    } catch (error) {
      console.error("Error fetching time:", error);
    }
  }
  useEffect(() => {
    getTime();
  }, []);
  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for display
  const formattedTime = new Date(time * 1000).toISOString().substr(11, 8);

  // Logout function to remove token cookie
  const handleLogout = () => {
    Cookies.remove("authToken"); // Remove the authentication token cookie
    // Redirect to login page after logout
    router.push("/login");
  };

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

          
          <Button 
            className="flex items-center px-5 font-medium"
            onClick={handleLogout}
          >
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
