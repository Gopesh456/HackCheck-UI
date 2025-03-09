"use client";
import React, { useEffect, useState, useRef } from "react";

export default function Login() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [leftEyePosition, setLeftEyePosition] = useState({ x: 0, y: 0 });
  const [rightEyePosition, setRightEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // For cursor blob animation
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const blobRef = useRef(null);
  const [isPointer, setIsPointer] = useState(false);

  // References for eyes
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  // Setup random blinking
  useEffect(() => {
    let blinkTimeout;

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
    const handleMouseMove = (event) => {
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

      setCursorPosition({ x: clientX, y: clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.tagName.toLowerCase() === "a" ||
          target.tagName.toLowerCase() === "button" ||
          target.closest("a") ||
          target.closest("button")
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
    eyePosition,
    mousePosition,
    maxDistance = 10
  ) => {
    const deltaX = mousePosition.x - eyePosition.x;
    const deltaY = mousePosition.y - eyePosition.y;

    // Calculate distance and angle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    // Limit movement to maxDistance
    let movementX = Math.min(distance, maxDistance) * Math.cos(angle);
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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#192226]">
      {/* Sleek background design */}
      <div className="absolute inset-0 overflow-hidden bg-design">
        <svg
          className="absolute w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 800"
        >
          {/* Curved lines */}
          <path
            d="M-100,200 C200,150 300,50 1300,250"
            className="animated-line"
            stroke="#EAB308"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M-100,400 C100,350 700,550 1300,450"
            className="animated-line"
            stroke="#EAB308"
            strokeWidth="1.4"
            fill="none"
            style={{ animationDelay: "0.2s" }}
          />
          <path
            d="M-100,600 C400,750 900,650 1300,600"
            className="animated-line"
            stroke="#EAB308"
            strokeWidth="1.4"
            fill="none"
            style={{ animationDelay: "0.4s" }}
          />

          {/* Geometric elements */}
          <circle
            cx="10%"
            cy="20%"
            r="50"
            className="geometric"
            fill="rgba(234, 179, 8, 0.03)"
          />
          <circle
            cx="80%"
            cy="70%"
            r="100"
            className="geometric"
            fill="rgba(234, 179, 8, 0.02)"
          />
          <rect
            x="70%"
            y="10%"
            width="150"
            height="150"
            className="geometric"
            fill="rgba(234, 179, 8, 0.01)"
          />

          {/* Grid pattern */}
          <pattern
            id="grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="40" height="40" fill="none" />
            <path
              d="M 40 0 L 0 0 0 40"
              stroke="rgba(234, 179, 8, 0.05)"
              strokeWidth="5"
              fill="none"
            />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Cursor blob */}
      <div
        className={`cursor-blob ${isPointer ? "cursor-pointer" : ""}`}
        ref={blobRef}
      ></div>
      <div
        className={`cursor-dot ${isPointer ? "cursor-pointer" : ""}`}
        style={{ left: cursorPosition.x, top: cursorPosition.y }}
      ></div>

      <div className="relative z-10 bg-[#172024] p-5 box-content grid justify-center align-middle rounded-[70px] shadow-lg sm:w-80 sm:h-96 opacity-86 backdrop-blur-xl">
        <div className="w-full rounded-[50px] flex flex-col items-center justify-center h-full">
          <div className="eyes-container mb-6">
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

          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            Sign in
          </h2>
          <p className="text-gray-400 mb-6 text-center">
            Welcome to{" "}
            <a href="#" className="text-yellow-500">
              Bhavans Hackathon
            </a>
          </p>
          <form>
            <div className="mb-4">
              <input
                type="text"
                id="username"
                placeholder="Username"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                    className="h-5 w-5"
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
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Enter
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
          height: 60px;
          width: 60px;
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
          width: 20px;
          height: 20px;
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
          background-color: rgba(234, 179, 8, 0.2);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s, background-color 0.2s;
        }

        .cursor-dot.cursor-pointer {
          transform: translate(-50%, -50%) scale(1.5);
        }

        .cursor-blob.cursor-pointer {
          width: 60px;
          height: 60px;
          background-color: rgba(234, 179, 8, 0.1);
        }

        body {
          cursor: none;
        }

        a,
        button,
        [role="button"] {
          cursor: none;
        }

        .bg-design {
          background: linear-gradient(
            135deg,
            rgba(25, 34, 38, 1) 0%,
            rgba(23, 32, 36, 1) 100%
          );
        }

        .animated-line {
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: draw 4s forwards alternate ease-in-out;
          opacity: 1;
        }

        .geometric {
          animation: pulse 8s infinite alternate;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
