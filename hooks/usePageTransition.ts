"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

export function usePageTransition() {
  const { setIsLoading } = useLoading();
  const pathname = usePathname();

  useEffect(() => {
    // Set loading to false when the page has fully loaded
    const handlePageLoad = () => {
      setIsLoading(false);
    };

    // Show loading indicator when a new navigation starts
    const handleNavigationStart = () => {
      setIsLoading(true);
    };

    // Hide loading indicator when navigation is complete
    window.addEventListener("load", handlePageLoad);

    // For Next.js router events
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    // Clean up when pathname changes - the page has loaded
    setIsLoading(false);

    return () => {
      window.removeEventListener("load", handlePageLoad);
    };
  }, [pathname, setIsLoading]);
}
