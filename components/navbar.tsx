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
  // Inbox modal state
  const [showInboxModal, setShowInboxModal] = useState(false);
  // Countdown state
  const [time, setTime] = useState(1); // Set initial countdown time in seconds (e.g., 1 hour)
  // Sample inbox data (will be replaced with API data later)
  interface InboxItem {
    id: number;
    title: string;
    username: string;
    download_url: string;
    question_number: number;
    time_shared: string;
    code: string;
  }

  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Function to refresh inbox items
  const refreshInbox = () => {
    getSharedList();
    setCurrentPage(1); // Reset to first page on refresh
  };

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inboxItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inboxItems.length / itemsPerPage);

  // Page navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to go to a specific page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Function to download the file from static_file URL
  interface DownloadCodeParams {
    url: string;
    filename: string;
  }

  const downloadCode = ({ url, filename }: DownloadCodeParams): void => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = blobUrl;
        a.download = filename || "code.py";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => console.error("Error downloading file:", error));
  };

  async function getSharedList() {
    try {
      // Clear previous items before adding new ones
      setInboxItems([]);

      const res = await fetchData("get_shared_code/", "POST", null);

      interface SharedCode {
        code: string;
        question_number: number;
        static_file: string;
        time_shared: string;
        team_member_name: string;
      }

      // Map the shared codes to inbox items
      const newInboxItems = res.shared_codes.map((item: SharedCode) => ({
        id: Math.random().toString(36).substr(2, 9), // Generate unique ID
        title: `Q${item.question_number} - ${item.time_shared}`,
        username: item.team_member_name,
        download_url: item.static_file,
        question_number: item.question_number,
        time_shared: item.time_shared,
        code: item.code,
      }));

      setInboxItems(newInboxItems);
    } catch (error) {
      console.error("Error fetching shared code:", error);
    }
  }

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
    getSharedList();
  }, []);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        return newTime;
      });

      // This log shows the state from the previous render due to closure

      if (time <= 0) {
        router.push("/credits");
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [time, router]);

  // Format time for display
  const formattedTime = new Date(time * 1000).toISOString().substr(11, 8);

  // Logout function to remove token cookie
  const handleLogout = () => {
    Cookies.remove("token"); // Remove the authentication token cookie
    // Redirect to login page after logout
    router.push("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full p-4 text-white border-b border-gray-800 shadow-lg bg-transperant backdrop-blur-md">
        <div className="container flex items-center justify-between w-full mx-auto">
          {/* Company Name/Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold"
          >
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
              <button
                onClick={() => {
                  setShowInboxModal(true);
                }}
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
                    d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm-.293 9.293a1 1 0 0 1 0 1.414L9.414 14l1.293 1.293a1 1 0 0 1-1.414 1.414l-2-2a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0Zm2.586 1.414a1 1 0 0 1 1.414-1.414l2 2a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414-1.414L14.586 14l-1.293-1.293Z"
                    clipRule="evenodd"
                  />
                </svg>

                <span>Inbox</span>
              </button>
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

      {/* Inbox Modal - Positioned outside the nav to overlay the entire page */}
      {showInboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-transperant backdrop-blur-lg dark">
          <div className="w-full max-w-2xl p-6 mx-auto my-8 bg-gray-900 rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Inbox</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={refreshInbox}
                  className="flex items-center px-5 font-medium "
                >
                  <svg
                    className="w-6 h-6 text-gray-900 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
                    />
                  </svg>
                  Refresh
                </Button>
                <Button
                  onClick={() => setShowInboxModal(false)}
                  variant="destructive"
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[70vh]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-gray-300 border-b border-gray-700">
                    <th className="px-4 py-2">Question</th>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-white">
                        Question {item.question_number}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {item.time_shared}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {item.username}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white"
                          onClick={() =>
                            downloadCode({
                              url: item.download_url,
                              filename: `question_${item.question_number}_${item.username}.py`,
                            })
                          }
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 15L12 3M12 3L8 7M12 3L16 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2 17L2 20C2 21.1046 2.89543 22 4 22L20 22C21.1046 22 22 21.1046 22 20L22 17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inboxItems.length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  No messages in your inbox
                </div>
              )}

              {/* Pagination controls - only show if more than 6 items */}
              {inboxItems.length > itemsPerPage && (
                <div className="flex items-center justify-center mt-4 space-x-2">
                  <Button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1"
                  >
                    &laquo; Prev
                  </Button>

                  {pageNumbers.map((number) => (
                    <Button
                      key={number}
                      onClick={() => goToPage(number)}
                      variant={currentPage === number ? "default" : "outline"}
                      size="sm"
                      className="px-3 py-1"
                    >
                      {number}
                    </Button>
                  ))}

                  <Button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="px-3 py-1"
                  >
                    Next &raquo;
                  </Button>
                </div>
              )}

              {inboxItems.length > 0 && (
                <div className="mt-2 text-sm text-center text-gray-400">
                  Showing {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, inboxItems.length)} of{" "}
                  {inboxItems.length} items
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
