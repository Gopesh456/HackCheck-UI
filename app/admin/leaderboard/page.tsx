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
import { useState, useEffect, useRef } from "react";
import { fetchData } from "@/utils/api";

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
          // Store current team rankings before updating
          const currentTeamsMap = new Map<number, Team>();
          teams.forEach((team) => {
            currentTeamsMap.set(team.id, { ...team });
          });
          previousTeamsRef.current = currentTeamsMap;

          // Transform API data into our Team interface format
          const transformedTeams = response.teams.map((item: any) => ({
            id: item.id,
            name: item.team_name,
            points: item.score,
            members:
              item.participants && item.participants.length > 0
                ? item.participants
                : previousTeamsRef.current.get(item.id)?.members ||
                  defaultMembers[
                    Math.floor(Math.random() * defaultMembers.length)
                  ] || ["Team Member"],
            rank: 0, // Will be updated after sorting
            previousRank: previousTeamsRef.current.get(item.id)?.rank,
          }));

          // Sort by points in descending order
          const sortedTeams = transformedTeams.sort(
            (a, b) => b.points - a.points
          );

          // Update ranks based on sorting
          const teamsWithRanks = sortedTeams.map((team, idx) => ({
            ...team,
            rank: idx + 1,
          }));

          setTeams(teamsWithRanks);
          setError(null);
          initialLoadCompleted.current = true;
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data", error);
        // Only show error if it's the first load
        if (!initialLoadCompleted.current) {
          setError("Failed to load leaderboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchTeams, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-4 sm:px-6 lg:px-8">
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
                return (
                  <motion.div
                    key={team.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 50,
                        mass: 1,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.2 },
                    }}
                    className="relative group"
                  >
                    <motion.div
                      className="absolute inset-0 transform bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-xl -skew-x-2"
                      layout
                    />
                    <motion.div
                      layout
                      className={`relative p-8 transition-all duration-300 border bg-zinc-900/90 backdrop-blur-xl rounded-xl 
                        ${
                          team.previousRank && team.previousRank !== team.rank
                            ? team.rank < team.previousRank
                              ? "border-green-500/30 shadow-sm shadow-green-500/20"
                              : "border-red-500/30 shadow-sm shadow-red-500/20"
                            : "border-zinc-800/50"
                        } 
                        group-hover:border-zinc-700/50`}
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
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
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
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
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
      </div>
    </div>
  );
}
