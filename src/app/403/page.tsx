"use client";

import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <section className="min-h-[85vh] flex items-center justify-center bg-[var(--color-bg)] px-5 pt-[70px]">
      <div className="max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-amber-100 p-6">
            <ShieldOff className="w-16 h-16 text-amber-800" aria-hidden />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-primary)] tracking-tight">
          403
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--heading-color)]">
          Access not allowed
        </h2>
        <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed">
          This area is only for shop administrators. If you have an account, log in with the correct
          role, or go back to shopping.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="border border-[var(--color-primary)] text-[var(--color-primary)] px-8 py-3 rounded-full text-sm font-medium hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            Shop
          </Link>
          <Link
            href="/login"
            className="text-neutral-700 px-8 py-3 rounded-full text-sm font-medium hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}
