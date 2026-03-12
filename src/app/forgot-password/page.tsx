"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await forgotPassword({ email });
      setMessage(res.data?.message || "Password reset OTP sent to your email");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f3e2f] mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Enter your email address to receive a secure password reset code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2f5d50] hover:bg-[#244a40] text-white py-3 rounded-xl font-medium transition shadow-lg disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Remember your password?
          <span
            className="text-[#2f5d50] font-medium ml-1 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
