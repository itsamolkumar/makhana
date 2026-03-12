"use client";

import { useState } from "react";
import { loginUser, googleLoginUser, resendOtp } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginStart, loginSuccess, loginFailure } from "@/redux/slices/authSlice";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error: reduxError } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLocalError("");
    setResendSuccess("");
    setIsUnverified(false);
    dispatch(loginStart());

    try {
      const response = await loginUser({ email, password });
      
      // The API returns the user and tokens upon successful login
      if (response.data?.data?.user) {
        dispatch(loginSuccess(response.data.data.user));
      }
      router.push("/");
    } catch (err: any) {
      const errMessage = err.response?.data?.message || "Invalid email or password";
      setLocalError(errMessage);
      
      // If 403 Forbidden because of Unverified Email
      if (err.response?.status === 403) {
        setIsUnverified(true);
      }
      
      dispatch(loginFailure(errMessage));
    }
  };

  const handleResendOtp = async () => {
    try {
      setLocalError("");
      setResendSuccess("");
      await resendOtp({ email });
      setResendSuccess("A new verification code has been sent to your email.");
      
      setTimeout(() => {
         router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1500);

    } catch (err: any) {
      setLocalError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLocalError("");
        dispatch(loginStart());
        const response = await googleLoginUser(tokenResponse.access_token);
        if (response.data?.data?.user) {
          dispatch(loginSuccess(response.data.data.user));
        }
        router.push("/");
      } catch (err: any) {
        const errMessage = err.response?.data?.message || "Google login failed";
        setLocalError(errMessage);
        dispatch(loginFailure(errMessage));
      }
    },
    onError: () => {
      setLocalError("Google login failed");
      dispatch(loginFailure("Google login failed"));
    }
  });

  const displayError = localError || reduxError;

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2f3e2f] mb-2">
        Welcome Back
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        Login to continue your healthy snacking journey
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
        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-1">
            <span 
              onClick={() => router.push("/forgot-password")}
              className="text-xs text-[#2f5d50] hover:underline cursor-pointer"
            >
              Forgot Password?
            </span>
          </div>
        </div>

        {displayError && (
          <p className="text-red-500 text-sm font-medium">{displayError}</p>
        )}

        {resendSuccess && (
          <p className="text-green-600 text-sm font-medium">{resendSuccess}</p>
        )}

        {isUnverified && !resendSuccess && (
          <button
            type="button"
            onClick={handleResendOtp}
            className="w-full border-2 border-[#2f5d50] text-[#2f5d50] hover:bg-[#2f5d50]/5 py-2.5 rounded-xl font-semibold transition"
          >
            Resend Verification Email
          </button>
        )}

        <button
          className="w-full bg-[#2f5d50] hover:bg-[#244a40] text-white py-3 rounded-xl font-medium transition shadow-lg disabled:opacity-70 flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Login"
          )}
        </button>
      </form>

      {/* divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-sm text-gray-400">OR</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {/* Google login */}
      <button 
        type="button"
        onClick={() => loginWithGoogle()}
        disabled={loading}
        className="w-full border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition flex justify-center items-center gap-2 disabled:opacity-70"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don’t have an account?
        <span
          className="text-[#2f5d50] font-medium ml-1 cursor-pointer"
          onClick={() => router.push("/register")}
        >
          Sign up
        </span>
      </p>
    </div>
  );
}