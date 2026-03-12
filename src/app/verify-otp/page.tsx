import { Suspense } from "react";
import OtpForm from "@/components/auth/OtpForm";

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[#f5efe6] flex items-center justify-center px-4 py-10">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* OTP FORM */}
        <div className="flex justify-center flex-col items-center">
          <Suspense fallback={<div>Loading verify form...</div>}>
            <OtpForm />
          </Suspense>
        </div>

        {/* IMAGE */}
        <div className="flex justify-center">
          <img
            src="/makhana-premium1.png"
            className="w-full max-w-md md:max-w-lg h-[240px] md:h-[420px] object-cover rounded-3xl shadow-xl"
            alt="Premium Makhana"
          />
        </div>
      </div>
    </div>
  );
}
