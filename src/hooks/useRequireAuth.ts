import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";

/**
 * Hook to require authentication on a page
 * Redirects to login if user is not authenticated
 * @param redirectTo - Optional path to redirect back to after login
 * @returns { isChecking, isAuthorized }
 */
export function useRequireAuth(redirectTo?: string) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(!isInitialized);

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) {
      return;
    }

    setIsChecking(false);

    // Redirect if not authenticated
    if (!isAuthenticated) {
      const loginUrl = redirectTo 
        ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
        : "/login";
      router.push(loginUrl);
    }
  }, [isInitialized, isAuthenticated, router, redirectTo]);

  return {
    isChecking,
    isAuthorized: isAuthenticated && isInitialized,
  };
}
