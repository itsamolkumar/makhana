"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/authService";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword({ email, otp, newPassword });
      setMessage(res.data?.message || "Password reset successfully");
      
      setTimeout(() => {
        router.push("/login");
      }, 2500);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2f3e2f] mb-2">
        Reset Password
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        Enter the 6-digit verification code sent to your email and your new password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50] bg-gray-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          readOnly={!!initialEmail} // Lock email if it came from URL
        />
        
        <input
          type="text"
          placeholder="6-digit OTP Code"
          maxLength={6}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50] tracking-widest"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          required
        />

        <input
          type="password"
          placeholder="New Password (min 6 chars)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

        <button
          type="submit"
          disabled={loading || message !== ""}
          className="w-full bg-[#2f5d50] hover:bg-[#244a40] text-white py-3 rounded-xl font-medium transition shadow-lg disabled:opacity-70 flex items-center justify-center mt-2"
        >
          {loading ? (
             <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
             "Update Password"
          )}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Go back to <Link href="/login" className="text-[#2f5d50] font-medium hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 py-10">
      <Suspense fallback={<div>Loading form...</div>}>
         <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
