"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/services/authService";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess } from "@/redux/slices/authSlice";

export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Safely decode the email from URL
  const rawEmail = searchParams.get("email") || "";
  const email = rawEmail ? decodeURIComponent(rawEmail) : "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character if user typed quickly
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus appropriate input after paste
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await verifyOtp({ email, otp: otpValue });
      
      // The API returns the user and tokens upon successful OTP verify
      if (response.data?.data?.user) {
        dispatch(loginSuccess(response.data.data.user));
      }
      
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f3e2f] mb-2">
          Verify Email
        </h2>
        <p className="text-gray-500 text-sm">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-medium text-[#2f3e2f]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-[#2f5d50] focus:ring-2 focus:ring-[#2f5d50]/20 focus:outline-none transition-all"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center font-medium">
            {error}
          </p>
        )}

        <button
          disabled={loading || otp.join("").length !== 6}
          className="w-full bg-[#2f5d50] hover:bg-[#244a40] text-white py-4 rounded-xl font-medium transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Verify Account"
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <p className="text-gray-500">Didn't receive the code?</p>
        <button className="text-[#2f5d50] font-medium mt-1 hover:underline">
          Resend OTP
        </button>
      </div>
    </div>
  );
}
