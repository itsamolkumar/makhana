import Link from "next/link";
import { ShieldAlert, Mail } from "lucide-react";

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 text-center">
        
        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <ShieldAlert className="text-red-500" size={40} />
        </div>

        <h1 className="text-2xl font-bold text-neutral-800 mb-3">
          Account Suspended
        </h1>
        
        <p className="text-neutral-600 mb-8 leading-relaxed">
          Your account access has been revoked by administrators. If you believe this is a mistake, please reach out to our support team for clarification.
        </p>

        <div className="space-y-3">
          <Link href="/contact" className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[var(--color-primary)] hover:bg-[#183b2a] text-white rounded-xl font-medium transition duration-200">
            <Mail size={18} />
            Contact Support
          </Link>
          <Link href="/" className="w-full inline-block py-3.5 px-4 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded-xl font-medium transition duration-200">
            Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
