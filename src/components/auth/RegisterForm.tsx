"use client";

import { useState } from "react";
import { registerUser, googleLoginUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginStart, loginFailure, loginSuccess } from "@/redux/slices/authSlice";
import { useGoogleLogin } from "@react-oauth/google";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLocalError("");
    dispatch(loginStart());

    try {
      await registerUser({ name, email, password, mobile });
      
      // Stop loading state (we aren't logged in yet, we just sent OTP)
      dispatch(loginFailure("")); 
      
      // Redirect to OTP Verification page passing the email as reference
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      const errMessage = err.response?.data?.message || err.response?.data?.error || "Registration failed";
      setLocalError(errMessage);
      dispatch(loginFailure(errMessage));
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
        const errMessage = err.response?.data?.message || "Google signup failed";
        setLocalError(errMessage);
        dispatch(loginFailure(errMessage));
      }
    },
    onError: () => {
      setLocalError("Google signup failed");
      dispatch(loginFailure("Google signup failed"));
    }
  });

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2f3e2f] mb-2">
        Create Account
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        Start your healthy snacking journey
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email address"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Mobile Number (10 digits)"
          maxLength={10}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f5d50]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {localError && (
          <p className="text-red-500 text-sm">{localError}</p>
        )}

        <button
          className="w-full bg-[#2f5d50] hover:bg-[#244a40] text-white py-3 rounded-xl font-medium transition shadow-lg disabled:opacity-70 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
             <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Register"
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
        Sign up with Google
      </button>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Already have an account?
        <span
          onClick={() => router.push("/login")}
          className="text-[#2f5d50] font-medium ml-1 cursor-pointer"
        >
          Login
        </span>
      </p>
    </div>
  );
}