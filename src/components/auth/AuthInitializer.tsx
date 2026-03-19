"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess, logoutUser, setInitialized } from "@/redux/slices/authSlice";
import { getCurrentUser } from "@/services/authService";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      try {
        console.log("AuthInitializer: Fetching current user...");
        const res = await getCurrentUser();
        console.log("AuthInitializer: Full response:", res);
        console.log("AuthInitializer: res.data:", res.data);
        console.log("AuthInitializer: res.data.data:", res.data?.data);
        console.log("AuthInitializer: User object:", res.data?.data?.user);
        
        if (res.data?.data?.user) {
          console.log("AuthInitializer: Dispatching loginSuccess with user:", res.data.data.user);
          console.log("AuthInitializer: User addresses:", res.data.data.user.addresses);
          dispatch(loginSuccess(res.data.data.user));
        } else {
          console.log("AuthInitializer: No user found in response, logging out");
          dispatch(logoutUser());
        }
      } catch (error) {
        console.error("AuthInitializer: Error fetching user:", error);
        dispatch(logoutUser());
      } finally {
        dispatch(setInitialized());
      }
    };
    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}
