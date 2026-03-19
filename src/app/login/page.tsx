"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users away from login page
    if (isInitialized && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 py-10">

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">

        {/* LOGIN FORM */}

        <div className="order-1 md:order-2 flex justify-center">

          <LoginForm />

        </div>


        {/* PRODUCT IMAGE */}

        <div className="order-2 md:order-1 flex justify-center">

          <img
            src="/makhana-premium1.png"
            className="w-full max-w-md md:max-w-lg h-[240px] md:h-[420px] object-cover rounded-3xl shadow-xl"
          />

        </div>

      </div>

    </div>
  );
}