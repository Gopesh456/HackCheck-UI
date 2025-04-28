"use client";
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { fetchData } from "@/utils/api";
import confetti from "canvas-confetti";

interface Team {
  id: number;
  name: string;
  points: number;
  members: string[];
  rank: number;
  previousRank?: number; // To track rank changes
}

// Default team members to use since API doesn't provide them yet
const defaultMembers = [
  ["Alice", "Bob", "Charlie"],
  ["David", "Eve", "Frank"],
  ["Grace", "Henry", "Ivy"],
  ["Jack", "Kelly", "Liam"],
  ["Mike", "Nina", "Oscar"],
];

const initialTeams: Team[] = [
  {
    id: 1,
    name: "Code Wizards",
    points: 2850,
    members: ["Alice", "Bob", "Charlie"],
    rank: 1,
  },
  {
    id: 2,
    name: "Binary Bandits",
    points: 2700,
    members: ["David", "Eve", "Frank"],
    rank: 2,
  },
  {
    id: 3,
    name: "Pixel Pirates",
    points: 2500,
    members: ["Grace", "Henry", "Ivy"],
    rank: 3,
  },
  {
    id: 4,
    name: "Data Dragons",
    points: 2300,
    members: ["Jack", "Kelly", "Liam"],
    rank: 4,
  },
  {
    id: 5,
    name: "Tech Titans",
    points: 2100,
    members: ["Mike", "Nina", "Oscar"],
    rank: 5,
  },
];

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousTeamsRef = useRef<Map<number, Team>>(new Map());
  const initialLoadCompleted = useRef(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [celebrationComplete, setCelebrationComplete] = useState(false);
  const nextTimeFetchRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger celebration animations with more confetti
  // (Duplicate declaration removed)

  // Helper function for confetti
  const triggerConfetti = (options: confetti.Options) => {
    if (typeof window !== "undefined") {
      confetti(options);
    }
  };

  // Trigger celebration animations with more confetti
  const triggerCelebration = useCallback(() => {
    if (celebrationComplete) return;

    setCelebrationComplete(true);

    // Global celebration effect - fireworks across the screen
    triggerConfetti({
      particleCount: 200,
      spread: 150,
      origin: { y: 0.7, x: 0.5 },
      colors: [
        "#FFD700",
        "#FFDF00",
        "#C0C0C0",
        "#CD7F32",
        "#FFC0CB",
        "#00FFFF",
      ],
      startVelocity: 45,
      gravity: 1.2,
      drift: 0,
      scalar: 1.2,
    });

    // Add side explosions
    setTimeout(() => {
      triggerConfetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5, x: 0.1 },
        colors: ["#FFD700", "#FFDF00", "#FFC0CB"],
        startVelocity: 35,
      });

      triggerConfetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5, x: 0.9 },
        colors: ["#FFD700", "#FFDF00", "#FFC0CB"],
        startVelocity: 35,
      });
    }, 500);

    if (teams.length >= 1) {
      // Gold celebration for 1st place - enhanced
      setTimeout(() => {
        triggerConfetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#FFD700", "#FFC800", "#FFDF00"],
          shapes: ["star", "circle"],
          ticks: 300,
        });
      }, 1000);
    }

    if (teams.length >= 2) {
      // Silver celebration for 2nd place - enhanced
      setTimeout(() => {
        triggerConfetti({
          particleCount: 150,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#C0C0C0", "#D3D3D3", "#A9A9A9"],
          shapes: ["circle"],
          ticks: 250,
        });
      }, 2000);
    }

    if (teams.length >= 3) {
      // Bronze celebration for 3rd place - enhanced
      setTimeout(() => {
        triggerConfetti({
          particleCount: 120,
          spread: 50,
          origin: { y: 0.7 },
          colors: ["#CD7F32", "#B87333", "#A57164"],
          shapes: ["circle"],
          ticks: 200,
        });
      }, 3000);
    }

    // Final burst after all the others
    setTimeout(() => {
      triggerConfetti({
        particleCount: 250,
        spread: 180,
        origin: { y: 0.5, x: 0.5 },
        startVelocity: 45,
        gravity: 0.8,
        colors: [
          "#FFD700",
          "#C0C0C0",
          "#CD7F32",
          "#FFC0CB",
          "#00FFFF",
          "#FF00FF",
        ],
        ticks: 400,
      });
    }, 4000);
  }, [celebrationComplete, teams]);

  // Fetch time left from API with smart timing
  useEffect(() => {
    const fetchTimeLeft = async () => {
      try {
        const response = await fetchData("get_time_left/", "POST", null);

        // Handle the API response, which has format {time_left: 52.947691}
        if (response && typeof response.time_left === "number") {
          // API returns seconds directly as time_left
          const totalSeconds = Math.round(response.time_left);

          // Set the time left state
          setTimeLeft(totalSeconds);

          // Show countdown animation when 5 or fewer seconds remain (but hide at 1 sec)
          const shouldShowCountdown = totalSeconds <= 5 && totalSeconds > 1;
          setShowCountdown(shouldShowCountdown);

          // Set next fetch time based on current seconds remaining
          let nextFetchDelay = 10000; // Default: 10 seconds

          if (totalSeconds <= 10) {
            nextFetchDelay = 1000; // 1 second when under 10 seconds
          } else if (totalSeconds <= 60) {
            nextFetchDelay = 5000; // 5 seconds when under 60 seconds
          } else if (totalSeconds <= 300) {
            nextFetchDelay = 10000; // 10 seconds when under 5 minutes
          } else {
            nextFetchDelay = 30000; // 30 seconds for longer times
          }

          // Clear any existing timeout
          if (nextTimeFetchRef.current) {
            clearTimeout(nextTimeFetchRef.current);
          }

          // Schedule next fetch unless time is already at 1 second or less
          if (totalSeconds > 1) {
            nextTimeFetchRef.current = setTimeout(
              fetchTimeLeft,
              nextFetchDelay
            );
          } else if (totalSeconds <= 1 && !celebrationComplete) {
            // Set time to 0 to indicate hackathon is over
            setTimeLeft(0);
            setShowCountdown(false); // Ensure countdown is hidden
            triggerCelebration();
          }
        } else if (response && typeof response.time_left_seconds === "number") {
          // Alternative API format
          const totalSeconds = Math.round(response.time_left_seconds);
          setTimeLeft(totalSeconds);
          setShowCountdown(totalSeconds <= 5 && totalSeconds > 1);

          // End hackathon at 1 second remaining
          if (totalSeconds <= 1 && !celebrationComplete) {
            setTimeLeft(0);
            setShowCountdown(false);
            triggerCelebration();
          }
        } else if (response && typeof response.time_left_minutes === "number") {
          // Fallback for old API format (minutes)
          const totalSeconds = Math.round(response.time_left_minutes * 60);
          setTimeLeft(totalSeconds);
          setShowCountdown(totalSeconds <= 5 && totalSeconds > 0);

          // End hackathon at 1 second remaining
          if (totalSeconds <= 1 && !celebrationComplete) {
            setTimeLeft(0);
            triggerCelebration();
          }
        } else if (response && typeof response === "number") {
          // Direct number response
          const totalSeconds = Math.round(response);
          setTimeLeft(totalSeconds);
          setShowCountdown(totalSeconds <= 5 && totalSeconds > 0);

          // End hackathon at 1 second remaining
          if (totalSeconds <= 1 && !celebrationComplete) {
            setTimeLeft(0);
            triggerCelebration();
          }
        } else {
          if (response) {
          }
        }
      } catch (error) {
        console.error("Error fetching time left:", error);
      }
    };

    // Initial fetch
    fetchTimeLeft();

    // Clean up timeout on unmount
    return () => {
      if (nextTimeFetchRef.current) {
        clearTimeout(nextTimeFetchRef.current);
      }
    };
  }, [celebrationComplete, triggerCelebration]);

  // Fetch team data from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Set loading state only on initial load
        if (!initialLoadCompleted.current) {
          setLoading(true);
        }

        const response = await fetchData("get_points/", "POST", null);

        if (response && response.teams) {
          // Use functional update to safely access previous state
          setTeams((prevTeams) => {
            // Store previous team rankings based on prevTeams
            const previousTeamsMap = new Map<number, Team>();
            prevTeams.forEach((team) => {
              previousTeamsMap.set(team.id, { ...team });
            });
            // Update the ref if it's used elsewhere, based on the state *before* this update
            previousTeamsRef.current = previousTeamsMap;

            // Transform API data into our Team interface format
            interface ApiResponse {
              teams: ApiTeam[];
            }
            interface ApiTeam {
              id: number;
              team_name: string;
              score: number;
              participants?: string[];
            }

            const transformedTeams: Team[] = (
              response as ApiResponse
            ).teams.map((item: ApiTeam) => {
              const previousTeam = previousTeamsMap.get(item.id);
              return {
                id: item.id,
                name: item.team_name,
                points: item.score,
                members:
                  item.participants && item.participants.length > 0
                    ? item.participants
                    : previousTeam?.members || // Use previous team data directly
                      defaultMembers[
                        Math.floor(Math.random() * defaultMembers.length)
                      ] || ["Team Member"],
                rank: 0, // Will be updated after sorting
                previousRank: previousTeam?.rank, // Use previous team data directly
              };
            });

            // Sort by points in descending order
            const sortedTeams = transformedTeams.sort(
              (a, b) => b.points - a.points
            );

            // Update ranks based on sorting
            const teamsWithRanks = sortedTeams.map((team, idx) => ({
              ...team,
              rank: idx + 1,
            }));

            return teamsWithRanks; // Return the new state
          });

          setError(null);
          initialLoadCompleted.current = true;
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        // Only show error if it's the first load
        if (!initialLoadCompleted.current) {
          setError("Failed to load leaderboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    // Refresh data every 5 seconds
    const interval = setInterval(fetchTeams, 5000);
    return () => clearInterval(interval);
  }, []); // Remove teams dependency to prevent infinite loop

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="relative">
            <Trophy className="w-10 h-10 text-amber-400" />
            <motion.div
              className="absolute inset-0"
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Trophy className="w-10 h-10 text-amber-400 blur-sm" />
            </motion.div>
          </div>
        );
      case 1:
        return <Medal className="w-9 h-9 text-zinc-300" />;
      case 2:
        return <Award className="w-9 h-9 text-amber-700" />;
      default:
        return (
          <div className="flex items-center justify-center border rounded-full w-9 h-9 bg-zinc-800 border-zinc-700">
            <span className="font-mono text-zinc-400">{index + 1}</span>
          </div>
        );
    }
  };

  // Function to determine rank change icon and animation
  const getRankChangeInfo = (team: Team) => {
    if (!team.previousRank || team.previousRank === team.rank) {
      return { icon: null, color: "", text: "" };
    }

    if (team.rank < team.previousRank) {
      return {
        icon: <TrendingUp className="w-4 h-4" />,
        color: "text-green-500",
        text: `+${team.previousRank - team.rank}`,
      };
    } else {
      return {
        icon: <TrendingDown className="w-4 h-4" />,
        color: "text-red-500",
        text: `-${team.rank - team.previousRank}`,
      };
    }
  };

  // Calculate max points or default to 100 if no teams
  const maxPoints =
    teams.length > 0 ? Math.max(...teams.map((team) => team.points), 0) : 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-amber-400" />
            <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text">
              Leaderboard
            </h1>
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-lg text-zinc-500">Excellence in Innovation</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 rounded-full border-t-amber-400 border-b-amber-400 border-l-transparent border-r-transparent animate-spin opacity-80"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center border rounded-xl bg-zinc-900/90 border-zinc-800/50">
            <p className="text-red-400">{error}</p>
            <p className="mt-2 text-zinc-500">Please try again later.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-5"
          >
            <AnimatePresence mode="popLayout">
              {teams.map((team, index) => {
                const rankChange = getRankChangeInfo(team);
                const isTopThree = index < 3 && timeLeft === 0;

                return (
                  <motion.div key={team.id} layout className="relative group">
                    {/* Winner highlight effect for top 3 when time hits zero */}
                    {isTopThree && (
                      <motion.div
                        className={`absolute inset-0 rounded-xl opacity-30 -z-10 ${
                          index === 0
                            ? "bg-amber-600"
                            : index === 1
                            ? "bg-zinc-400"
                            : "bg-amber-800"
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.1, 0.3, 0.1],
                          boxShadow: [
                            index === 0
                              ? "0 0 20px rgba(245, 158, 11, 0.4)"
                              : index === 1
                              ? "0 0 20px rgba(161, 161, 170, 0.4)"
                              : "0 0 20px rgba(146, 64, 14, 0.4)",
                            index === 0
                              ? "0 0 40px rgba(245, 158, 11, 0.6)"
                              : index === 1
                              ? "0 0 40px rgba(161, 161, 170, 0.6)"
                              : "0 0 40px rgba(146, 64, 14, 0.6)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}

                    <motion.div
                      className="absolute inset-0 transform bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-xl -skew-x-2"
                      layout
                    />

                    <motion.div
                      layout
                      className={`relative p-8 transition-all duration-300 border bg-zinc-900/90 backdrop-blur-xl rounded-xl ${
                        team.previousRank && team.previousRank !== team.rank
                          ? team.rank < team.previousRank
                            ? "border-green-500/30 shadow-sm shadow-green-500/20"
                            : "border-red-500/30 shadow-sm shadow-red-500/20"
                          : isTopThree
                          ? index === 0
                            ? "border-amber-500/50 shadow-lg shadow-amber-500/20"
                            : index === 1
                            ? "border-zinc-400/50 shadow-lg shadow-zinc-400/20"
                            : "border-amber-700/50 shadow-lg shadow-amber-700/20"
                          : "border-zinc-800/50"
                      } group-hover:border-zinc-700/50`}
                      animate={
                        team.previousRank && team.previousRank !== team.rank
                          ? {
                              borderColor: [
                                team.rank < team.previousRank
                                  ? "rgba(34, 197, 94, 0.3)"
                                  : "rgba(239, 68, 68, 0.3)",
                                "rgba(39, 39, 42, 0.5)",
                              ],
                              boxShadow: [
                                team.rank < team.previousRank
                                  ? "0 1px 10px rgba(34, 197, 94, 0.2)"
                                  : "0 1px 10px rgba(239, 68, 68, 0.2)",
                                "none",
                              ],
                            }
                          : {}
                      }
                      transition={{ duration: 3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {getPositionIcon(index)}
                          <div>
                            <h2 className="flex items-center gap-2 mb-1 text-2xl font-bold text-zinc-100">
                              {team.name}
                              {rankChange.icon && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`flex items-center ${rankChange.color} text-sm ml-2`}
                                >
                                  {rankChange.icon}
                                  <span className="ml-1">
                                    {rankChange.text}
                                  </span>
                                </motion.div>
                              )}
                            </h2>
                            <p className="font-medium text-zinc-500">
                              {team.members.join(" · ")}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          className="text-right"
                          key={`points-${team.id}-${team.points}`}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="font-mono text-3xl font-bold text-transparent bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text">
                            {team.points.toLocaleString()}
                          </div>
                          <div className="text-sm tracking-wider uppercase text-zinc-500">
                            points
                          </div>
                        </motion.div>
                      </div>
                      <div className="relative mt-6">
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            layout
                            animate={{
                              width:
                                maxPoints <= 0
                                  ? "0%"
                                  : `${Math.max(
                                      (team.points / maxPoints) * 100,
                                      0
                                    )}%`,
                            }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                          />
                        </div>
                        <motion.div
                          layout
                          animate={{
                            width:
                              maxPoints <= 0
                                ? "0%"
                                : `${Math.max(
                                    (team.points / maxPoints) * 100,
                                    0
                                  )}%`,
                            opacity: 0.15,
                          }}
                          transition={{ duration: 3 }}
                          className="absolute top-0 h-1.5 rounded-full bg-amber-400 blur-sm"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Countdown Timer Overlay - Only shows when timer is between 5 and 2 seconds */}
        {showCountdown &&
          timeLeft !== null &&
          timeLeft <= 5 &&
          timeLeft > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              style={{ pointerEvents: "none" }}
            >
              <div className="text-center px-12 py-8 rounded-xl bg-black/70 backdrop-blur-md border border-amber-500/30 bg-opacity-75">
                <motion.div
                  className="text-7xl font-bold text-amber-500 font-mono"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(245, 158, 11, 0.7)",
                      "0 0 20px rgba(245, 158, 11, 0.9)",
                      "0 0 10px rgba(245, 158, 11, 0.7)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {timeLeft}s
                </motion.div>
                <p className="text-zinc-300 mt-2 text-xl">Time Remaining</p>
              </div>
            </motion.div>
          )}

        {/* Winner Celebration Banner */}
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="fixed top-0 left-0 right-0 z-50 text-center pt-6 pb-8 px-4"
          >
            <motion.div
              className="inline-block py-4 px-8 rounded-xl bg-gradient-to-r from-amber-900/80 via-amber-600/80 to-amber-900/80 backdrop-blur-md border border-amber-400/50 shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 30px rgba(245, 158, 11, 0.4)",
                  "0 0 60px rgba(245, 158, 11, 0.6)",
                  "0 0 30px rgba(245, 158, 11, 0.4)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <h2 className="text-4xl font-bold text-amber-100 mb-1">
                Round 1 Complete!
              </h2>
              <p className="text-xl text-amber-200/80">
                Congratulations to all winners!
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
