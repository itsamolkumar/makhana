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
        const res = await getCurrentUser();
        if (res.data?.data?.user) {
          dispatch(loginSuccess(res.data.data.user));
        } else {
          dispatch(logoutUser());
        }
      } catch (error) {
        dispatch(logoutUser());
      } finally {
        dispatch(setInitialized());
      }
    };
    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}
