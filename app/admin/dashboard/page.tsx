"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { fetchData } from "@/utils/api";
// import { send } from "process";

export default function AdminDashboard() {
  const router = useRouter();
  const [websiteActive, setWebsiteActive] = useState();
  const [timer, setTimer] = useState({ hours: 1, minutes: 0 });
  const [remainingTime, setRemainingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [nTeams, setnTeams] = useState("Loading...");
  const [nQuestions, setnQuestions] = useState("Loading...");

  // const token = Cookie.get("token") || null;
  const [timerRunning, setTimerRunning] = useState(false);

  // Update the remaining time parsing function to handle time more robustly
  const updateRemainingTimeFromSeconds = (timeValue) => {
    let hours = 0,
      minutes = 0,
      seconds = 0;

    try {
      // Handle string format like "00:42:52.52795900000001"
      if (typeof timeValue === "string") {
        if (timeValue.includes(":")) {
          const timeParts = timeValue.split(":");
          hours = parseInt(timeParts[0]) || 0;
          minutes = parseInt(timeParts[1]) || 0;

          // Handle seconds that might have decimal part
          if (timeParts[2]) {
            const secondsPart = timeParts[2].split(".")[0]; // Remove any decimal part
            seconds = parseInt(secondsPart) || 0;
          }
        } else {
          // It's a string but not in time format, try parsing as number
          const totalSeconds = parseInt(timeValue) || 0;
          hours = Math.floor(totalSeconds / 3600);
          minutes = Math.floor((totalSeconds % 3600) / 60);
          seconds = Math.floor(totalSeconds % 60);
        }
      } else if (typeof timeValue === "number") {
        // It's already a number (seconds)
        const totalSeconds = Math.max(0, Math.floor(timeValue)); // Ensure non-negative integer
        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = Math.floor(totalSeconds % 60);
      }

      // Validate the values to ensure they're in valid ranges
      hours = Math.max(0, Math.min(23, hours));
      minutes = Math.max(0, Math.min(59, minutes));
      seconds = Math.max(0, Math.min(59, seconds));
    } catch (error) {
      console.error("Error parsing time value:", error, timeValue);
      // Default fallback values
      hours = 0;
      minutes = 0;
      seconds = 0;
    }

    setRemainingTime({ hours, minutes, seconds });
  };

  // Update the getDashboardData function to handle errors better
  async function getDashboardData() {
    try {
      const data = await fetchData("dashboard/", "POST", null, false);

      // Handle hackathon status
      if (data.hackathon_status !== undefined) {
        setWebsiteActive(data.hackathon_status);
      }

      // Handle team and question counts
      setnTeams(data.num_teams !== undefined ? data.num_teams : "N/A");
      setnQuestions(
        data.num_questions !== undefined ? data.num_questions : "N/A"
      );

      // Handle time safely
      if (
        data.time_left_seconds !== undefined &&
        data.time_left_seconds !== null
      ) {
        updateRemainingTimeFromSeconds(data.time_left_seconds);

        // Only set timer running if hackathon is active
        if (data.hackathon_status !== undefined) {
          setTimerRunning(data.hackathon_status);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  useEffect(() => {
    getDashboardData();

    // Set up periodic timer sync
    const syncInterval = setInterval(() => {
      getDashboardData();
    }, 15000); // Sync every 15 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // Function to toggle website active state
  async function toggleWebsiteStatus() {
    setWebsiteActive(!websiteActive);
    window.location.reload();
    if (!websiteActive) {
      const response = await fetchData("start_hackathon/", "POST", null, false);
      if (response.status === 200) {
        console.log("Website is active now");
      }
    } else {
      const response = await fetchData("end_hackathon/", "POST", null);
      if (response.status === 200) {
        console.log("Website is inactive now");
      }
    }
    // Here you would make an API call to activate/deactivate the website
    // For example: fetch('/api/website/toggle', { method: 'POST', body: JSON.stringify({ active: !websiteActive }) })
  }

  // Timer functions

  // Update timer inputs
  const handleTimerChange = (field: "hours" | "minutes", value: number) => {
    setTimer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveTimer = async () => {
    const totalSeconds = timer.hours * 3600 + timer.minutes * 60;
    const data = { time_left_seconds: totalSeconds };
    await fetchData("change_time_left/", "POST", data);

    // Update the displayed timer after saving
    updateRemainingTimeFromSeconds(totalSeconds);
    setTimerRunning(websiteActive);
  };

  // Effect to handle countdown
  useEffect(() => {
    let interval;

    if (timerRunning) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          // Calculate total seconds
          let totalSeconds =
            prev.hours * 3600 + prev.minutes * 60 + prev.seconds;

          // Decrement by 1 second
          totalSeconds = Math.max(0, totalSeconds - 1);

          // If timer reached zero
          if (totalSeconds <= 0) {
            // Trigger end hackathon
            endHackathon();
            setTimerRunning(false);
            return { hours: 0, minutes: 0, seconds: 0 };
          }

          // Convert back to hours, minutes, seconds
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          return { hours, minutes, seconds };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerRunning]);

  // Function to end hackathon
  const endHackathon = async () => {
    if (websiteActive) {
      const response = await fetchData("end_hackathon/", "POST", null);
      if (response.status === 200) {
        setWebsiteActive(false);
        console.log("Hackathon ended automatically as timer reached zero");
      }
    }
  };

  return (
    <div className="min-h-screen p-8 text-white bg-gray-900">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400">Manage your hackathon platform</p>
      </header>

      {/* Status Panel */}
      <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Platform Status</h2>
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${
                  websiteActive ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              {websiteActive ? "Active" : "Inactive"}
            </span>
            <button
              onClick={toggleWebsiteStatus}
              className={`px-4 py-2 rounded-md ${
                websiteActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } transition-colors`}
            >
              {websiteActive ? "Stop" : "Start"} Platform
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Teams</p>
              <p className="text-2xl">{nTeams}</p>
            </div>
            <div>
              <p className="text-gray-400">Questions</p>
              <p className="text-2xl">{nQuestions}</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 p-6 bg-gray-800 rounded-lg shadow-lg md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Set Competition Time</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm text-gray-400">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={timer.hours}
                  onChange={(e) =>
                    handleTimerChange("hours", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timer.minutes}
                  onChange={(e) =>
                    handleTimerChange("minutes", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={saveTimer}
              className="px-4 py-2 transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Time
            </button>

            {/* Running Timer Display */}
            <div className="p-4 mt-4 bg-gray-700 rounded-lg">
              <h3 className="mb-2 text-lg text-center text-gray-300">
                Running Competition Timer
              </h3>
              <div className="font-mono text-4xl text-center">
                {String(remainingTime.hours).padStart(2, "0")}:
                {String(remainingTime.minutes).padStart(2, "0")}:
                {String(Math.floor(remainingTime.seconds)).padStart(2, "0")}
              </div>
              <p className="mt-2 text-sm text-center text-gray-400">
                {timerRunning ? "Timer is running" : "Timer is paused"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Panels */}
      <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Team Management</h2>
          <p className="mb-4 text-gray-400">
            Add, remove, or modify participating teams.
          </p>
          <button
            onClick={() => router.push("/admin/teams")}
            className="flex items-center justify-center w-full py-3 transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </span>
            Manage Teams
          </button>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Question Management</h2>
          <p className="mb-4 text-gray-400">
            Create, edit, or delete questions for the hackathon.
          </p>
          <button
            onClick={() => router.push("/admin/questions")}
            className="flex items-center justify-center w-full py-3 transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
          >
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            Edit Questions
          </button>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Leaderboard</h2>
          <p className="mb-4 text-gray-400">
            View real-time rankings and participant scores.
          </p>
          <button
            onClick={() => router.push("/admin/leaderboard")}
            className="flex items-center justify-center w-full py-3 transition-colors bg-green-600 rounded-md hover:bg-green-700"
          >
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </span>
            View Leaderboard
          </button>
        </div>
      </div>

      {/* Other Controls */}
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Advanced Controls</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button className="p-4 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600">
            Export Results
          </button>
          <button className="p-4 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600">
            System Settings
          </button>
          <button className="p-4 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
}
