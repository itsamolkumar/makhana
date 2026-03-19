import Link from "next/link";

interface AuthLoadingProps {
  message?: string;
  description?: string;
  loginUrl?: string;
}

export default function AuthLoading({ 
  message = "Redirecting...", 
  description = "Please wait while we redirect you",
  loginUrl = "/login"
}: AuthLoadingProps) {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{message}</h2>
        <p className="text-gray-600">{description}</p>
        <p className="text-sm text-gray-500">
          If not redirected automatically,{" "}
          <Link href={loginUrl} className="text-[var(--color-primary)] font-semibold underline hover:no-underline">
            click here
          </Link>
        </p>
      </div>
    </div>
  );
}
