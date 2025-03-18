"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";

export function useNavigationWithLoading() {
  const router = useRouter();
  const { setIsLoading } = useLoading();

  const navigateTo = (path: string) => {
    setIsLoading(true);

    // Add a small delay to show loading state even for fast navigation
    setTimeout(() => {
      router.push(path);

      // Set a timeout to hide the loader if navigation takes too long
      // This is a fallback in case the page transition doesn't trigger the cleanup
      setTimeout(() => setIsLoading(false), 3000);
    }, 100);
  };

  return { navigateTo };
}
