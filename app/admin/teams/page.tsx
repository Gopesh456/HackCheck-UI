"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import { fetchData } from "@/utils/api";

export default function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); // Add specific auth loading state
  const [newTeam, setNewTeam] = useState({ team_name: "", password: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [error, setError] = useState(""); // Add error state

  useEffect(() => {
    // Get auth token from cookies
    const checkAuth = async () => {
      setAuthLoading(true);
      const token = Cookies.get("token");
      setAuthToken(token || "");

      if (token) {
        try {
          // Fetch teams data
          const response = await fetchData("get_teams/", "POST", null);
          if (response && response.teams) {
            setTeams(response.teams);
          }
        } catch (error) {
          console.error("Error fetching teams:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      // Auth check is complete
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.team_name || !newTeam.password) return;

    setIsAdding(true);
    setError(""); // Clear previous errors
    try {
      const addedTeam = await fetchData("register/", "POST", newTeam);
      setTeams([...teams, addedTeam]);
      setNewTeam({ team_name: "", password: "" });
      window.location.reload();
    } catch (error) {
      console.error("Error adding team:", error);
      // Check if the error response has error details
      if (error.response && error.response.error) {
        setError(error.response.error);
      } else {
        setError("Failed to add team. Please try again.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    setError(""); // Clear previous errors
    try {
      await fetchData("delete_team/", "POST", { team_id: id });
      setTeams(teams.filter((team) => team.id !== id));
    } catch (error) {
      console.error("Error deleting team:", error);
      // Check if the error response has error details
      if (error.response && error.response.error) {
        setError(error.response.error);
      } else {
        setError("Failed to delete team. Please try again.");
      }
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900">
        <div className="w-12 h-12 mb-4 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Show login prompt if no auth token (only after auth check is complete)
  if (!authToken && !authLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-900">
        <div className="p-8 text-center text-white bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Authentication Required</h2>
          <p className="mb-4">
            You need to be logged in as an admin to access this page.
          </p>
          <a
            href="/admin/login"
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 py-8 mx-auto text-gray-100 bg-gray-900">
      <h1 className="mb-8 text-3xl font-bold text-center text-white">
        Team Management
      </h1>

      {/* Error display */}
      {error && (
        <div className="p-4 mb-6 text-red-200 bg-red-900 border border-red-700 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Add Team Section */}
      <div className="p-6 mb-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-white">Add New Team</h2>
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="team_name"
                className="block mb-1 text-sm font-medium text-gray-300"
              >
                Team Name
              </label>
              <input
                type="text"
                id="team_name"
                name="team_name"
                value={newTeam.team_name}
                onChange={handleInputChange}
                className="w-full p-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter team name"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={newTeam.password}
                onChange={handleInputChange}
                className="w-full p-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter team password"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAdding || !newTeam.team_name || !newTeam.password}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400"
            >
              <PlusCircle size={18} />
              {isAdding ? "Adding..." : "Add Team"}
            </button>
          </div>
        </form>
      </div>

      {/* Teams List */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Existing Teams
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-b-2 border-indigo-400 rounded-full animate-spin"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            No teams found. Add your first team above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">
                    Team Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-300 uppercase">
                    Password
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-200 whitespace-nowrap">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-200 whitespace-nowrap">
                      {team.password}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="flex items-center gap-1 ml-auto text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
