import React from "react";
import Loader from "@/components/Loader";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
}

export function LoadingIndicator({
  fullScreen = false,
  message = "Loading...",
}: LoadingIndicatorProps) {
  const container = fullScreen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#04080A] rounded-lg p-6 shadow-xl flex flex-col items-center">
        <Loader />
        {message && <p className="mt-4 text-white animate-pulse">{message}</p>}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader />
      {message && (
        <p className="mt-4 text-sm text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );

  return container;
}
