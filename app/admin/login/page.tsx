"use client";
import React, { useEffect, useState, useRef } from "react";
import { fetchData } from "@/utils/api";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useLoading } from "@/contexts/LoadingContext";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [leftEyePosition, setLeftEyePosition] = useState({ x: 0, y: 0 });
  const [rightEyePosition, setRightEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setIsLoading: setGlobalLoading } = useLoading();

  // For cursor blob animation
  const blobRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);

  // References for eyes
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  // Setup random blinking
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;

    const scheduleBlink = () => {
      const nextBlinkDelay = Math.random() * 5000 + 2000; // 2-7 seconds
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 200); // Blink duration
      }, nextBlinkDelay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Handle mouse movement for both eyes and cursor
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      const { clientX, clientY } = event;

      setMousePosition({
        x: clientX,
        y: clientY,
      });

      // Update cursor position with a delay for smooth movement
      if (blobRef.current) {
        // Add delay for smoother movement
        blobRef.current.style.left = `${clientX}px`;
        blobRef.current.style.top = `${clientY}px`;
      }

      if (dotRef.current) {
        dotRef.current.style.left = `${clientX}px`;
        dotRef.current.style.top = `${clientY}px`;
      }
    };

    // Define the interface for the mouse event target
    interface MouseTargetElement extends Element {
      tagName: string;
      closest(selector: string): Element | null;
    }

    const handleMouseOver = (e: MouseEvent): void => {
      const target = e.target as MouseTargetElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.tagName.toLowerCase() === "a" ||
          target.tagName.toLowerCase() === "button" ||
          !!target.closest("a") ||
          !!target.closest("button")
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);

    // Get initial eye positions
    updateEyePositions();

    // Update eye positions on window resize
    window.addEventListener("resize", updateEyePositions);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("resize", updateEyePositions);
    };
  }, []);

  // Update the positions of eyes when component mounts or window resizes
  const updateEyePositions = () => {
    if (leftEyeRef.current && rightEyeRef.current) {
      const leftRect = leftEyeRef.current.getBoundingClientRect();
      const rightRect = rightEyeRef.current.getBoundingClientRect();

      setLeftEyePosition({
        x: leftRect.left + leftRect.width / 2,
        y: leftRect.top + leftRect.height / 2,
      });

      setRightEyePosition({
        x: rightRect.left + rightRect.width / 2,
        y: rightRect.top + rightRect.height / 2,
      });
    }
  };

  // Calculate pupil movement based on vector from eye to cursor
  const calculatePupilTransform = (
    eyePosition: { x: number; y: number },
    mousePosition: { x: number; y: number },
    maxDistance = 10
  ) => {
    const deltaX = mousePosition.x - eyePosition.x;
    const deltaY = mousePosition.y - eyePosition.y;

    // Calculate distance and angle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    // Limit movement to maxDistance
    const movementX = Math.min(distance, maxDistance) * Math.cos(angle);
    let movementY = Math.min(distance, maxDistance) * Math.sin(angle);

    // Add constraint for Y-axis to keep pupil within the 3/4 circle
    // Limit upward movement more than downward movement
    if (movementY < -3) movementY = -3; // More strict limit for upward movement

    return `translate(calc(-50% + ${movementX}px), calc(-50% + ${movementY}px))`;
  };

  // Calculate transforms for both pupils
  const leftPupilTransform = calculatePupilTransform(
    leftEyePosition,
    mousePosition
  );
  const rightPupilTransform = calculatePupilTransform(
    rightEyePosition,
    mousePosition
  );
  const router = useRouter();

  interface LoginFormData {
    username: string;
    password: string;
  }

  interface ResponseData {
    token?: string;
    error?: string;
  }

  // Define a custom API error type
  interface ApiError extends Error {
    response?: {
      status?: number;
      data?: {
        message?: string;
      };
    };
    status?: number;
  }

  async function login(formData: LoginFormData) {
    if (!formData.username || !formData.password) {
      setErrorMessage("Username and password are required");
      return;
    }

    try {
      setIsLoading(true);
      setGlobalLoading(true);
      setErrorMessage(""); // Clear previous error messages

      const response: ResponseData = await fetchData(
        "admin_signin/",
        "POST",
        formData,
        false,
        true
      );

      // Handle successful login
      if (response.token) {
        Cookies.set("token", response.token, { expires: 1, sameSite: "lax" }); // Expires in 1 day
        router.push("/admin/dashboard"); // Redirect to admin dashboard
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);

      const apiError = error as ApiError;

      if (apiError.response?.data?.message) {
        // Use server-provided error message if available
        setErrorMessage(apiError.response.data.message);
      } else if (apiError.response?.status === 401) {
        setErrorMessage("Invalid credentials. Please check and try again.");
      } else if (apiError.status === 400 || apiError.response?.status === 400) {
        setErrorMessage("Invalid login details. Please check and try again.");
      } else if (apiError.status === 429 || apiError.response?.status === 429) {
        setErrorMessage("Too many login attempts. Please try again later.");
        console.error("Login failed:", error);

        if (
          error instanceof Error &&
          (error as ApiError).response?.data?.message
        ) {
          // Use server-provided error message if available
          setErrorMessage(
            (error as ApiError).response?.data?.message ||
              "An unknown error occurred"
          );
        } else if (
          error instanceof Error &&
          (error as ApiError).response?.status === 401
        ) {
          setErrorMessage("Invalid credentials. Please check and try again.");
        } else if (
          error instanceof Error &&
          ((error as ApiError).status === 400 ||
            (error as ApiError).response?.status === 400)
        ) {
          setErrorMessage("Invalid login details. Please check and try again.");
        } else if (
          error instanceof Error &&
          ((error as ApiError).status === 429 ||
            (error as ApiError).response?.status === 429)
        ) {
          setErrorMessage("Too many login attempts. Please try again later.");
        } else if (!navigator.onLine) {
          setErrorMessage(
            "Network error. Please check your internet connection."
          );
        } else {
          setErrorMessage("Login failed. Please try again later.");
        }
      }
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  }

  // When component unmounts during navigation, clear loading state
  useEffect(() => {
    return () => {
      setGlobalLoading(false);
    };
  }, [setGlobalLoading]);

  return (
    <main className="relative">
      <div className="relative min-h-screen flex items-center justify-center bg-[#04080A] px-4">
        {/* Video background - centered and 50% size */}
        <div className="absolute w-full h-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full rounded-lg object-fit"
          >
            <source src="/orb.mp4" type="video/mp4" />
          </video>

          {/* Overlay to darken the video */}
          <div className="absolute inset-0 bg-black rounded-lg opacity-50"></div>
        </div>

        {/* Cursor blob */}
        <div
          className={`cursor-blob ${isPointer ? "cursor-pointer" : ""}`}
          ref={blobRef}
        ></div>
        <div
          className={`cursor-dot ${isPointer ? "cursor-pointer" : ""}`}
          ref={dotRef}
        ></div>

        <div className="relative z-10 flex flex-col w-full max-w-[275px] sm:max-w-[300px] px-1 py-1 mx-auto bg-transparent rounded-3xl backdrop-blur-md sm:justify-center sm:py-2 md:flex-none md:px-2 lg:py-3 lg:px-3 xl:py-4 xl:px-4">
          <div className="w-full rounded-[50px] flex flex-col items-center justify-center h-full p-3 sm:p-4">
            <div className="mb-6 eyes-container">
              <div
                className={`eye ${
                  isBlinking || (isPasswordFocused && !showPassword)
                    ? "blinking"
                    : ""
                }`}
                ref={leftEyeRef}
              >
                <div
                  className="pupil"
                  style={{
                    transform: !(isPasswordFocused && !showPassword)
                      ? leftPupilTransform
                      : "translate(-50%, -50%)",
                    opacity: isPasswordFocused && !showPassword ? 0 : 1,
                  }}
                />
              </div>
              <div
                className={`eye ${
                  isBlinking || (isPasswordFocused && !showPassword)
                    ? "blinking"
                    : ""
                }`}
                ref={rightEyeRef}
              >
                <div
                  className="pupil"
                  style={{
                    transform: !(isPasswordFocused && !showPassword)
                      ? rightPupilTransform
                      : "translate(-50%, -50%)",
                    opacity: isPasswordFocused && !showPassword ? 0 : 1,
                  }}
                />
              </div>
            </div>

            <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-center text-white">
              Sign in
            </h2>
            <p className="mb-6 text-sm sm:text-base text-center text-[#CBD5E0]">
              Welcome to{" "}
              <a href="#" className="text-[#CBD5E0]">
                Admin Portal
              </a>
            </p>
            <form onSubmit={handleSubmit(login)} noValidate className="w-full">
              <div className="relative mb-4">
                <input
                  {...register("username", {
                    required: "Username is required",
                  })}
                  type="text"
                  id="username"
                  placeholder="Username"
                  className={`w-full px-3 py-2 border-b-2 text-[#FFFFFF] p-3 transition-all duration-300 ease-in-out bg-[rgba(255, 255, 255, 0.1)] border-b-[#4A5568] focus:text-[#dcebf7] focus:bg-[rgba(255, 255, 255, 0.15)] focus:border-b-0 focus:outline-none focus:rounded-lg cursor-none ${
                    errors.username ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z"></path>
                  </svg>
                </span>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="relative mb-6">
                <input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  className={`w-full px-3 py-2 border-b-2 text-[#FFFFFF] p-3 transition-all duration-300 ease-in-out bg-[rgba(255, 255, 255, 0.1)] border-[#4A5568] focus:text-[#dcebf7] focus:bg-[rgba(255, 255, 255, 0.15)] focus:border-b-0 focus:outline-none focus:rounded-lg cursor-none ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <button
                  type="button"
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-2 mb-4 text-sm text-center text-red-500 bg-red-100 rounded bg-opacity-20">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 font-semibold text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  isLoading
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Enter"
                )}
              </button>
            </form>
          </div>
        </div>

        <style jsx global>{`
          .eyes-container {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 4px;
          }
          .eye {
            border-radius: 50%;
            height: 50px;
            width: 50px;
            @media (min-width: 640px) {
              height: 60px;
              width: 60px;
            }
            background-color: #f3efef;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
            clip-path: polygon(0 25%, 100% 25%, 100% 100%, 0 100%);
            transition: clip-path 0.2s ease;
          }
          .eye.blinking {
            clip-path: polygon(0 90%, 100% 90%, 100% 100%, 0 100%);
          }
          .pupil {
            position: absolute;
            background-color: #382e25;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            @media (min-width: 640px) {
              width: 20px;
              height: 20px;
            }
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            transition: transform 0.05s ease-out, opacity 0.2s ease;
          }
          .cursor-dot {
            width: 2px;
            height: 2px;
            background-color: #eab308;
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s;
            transform: translate(-50%, -50%);
          }

          .cursor-blob {
            width: 30px;
            height: 30px;
            background: radial-gradient(circle, #4299e1aa 20%, #63b3ed77 80%);
            mix-blend-mode: screen;
            box-shadow: 0 0 15px #4299e1;
            border-radius: 50%;
            position: fixed;
            pointer-events: none;
            z-index: 9998;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s, background-color 0.2s;
          }
          input-field:hover ~ .cursor-blob {
            background: #4299e1cc;
          }
          .cursor-dot.cursor-pointer {
            transform: translate(-50%, -50%) scale(1.5);
          }

          .cursor-blob.cursor-pointer {
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, #1e3a8aaa 20%, #2a4365aa 80%);
          }

          input,
          textarea,
          select {
            cursor: none !important;
            caret-color: #63b3ed !important; /* Show the text input caret with a blue color */
          }

          input:focus,
          textarea:focus,
          select:focus {
            box-shadow: 0 0 10px rgba(99, 179, 237, 0.3); /* Add a subtle glow effect on focus */
            border-radius: 8px;
            outline: 2px solid rgba(99, 179, 237, 0.5);
            outline-offset: 1px;
          }

          body {
            cursor: none;
          }

          a,
          button,
          [role="button"],
          input,
          textarea,
          select {
            cursor: none !important;
          }
        `}</style>
      </div>
    </main>
  );
}
