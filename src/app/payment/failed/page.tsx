"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { XCircle, CreditCard, Home } from "lucide-react";

export default function PaymentFailedPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("orderId"));
  }, []);

  const payAgainHref = orderId ? `/checkout?payOrder=${encodeURIComponent(orderId)}` : "/checkout";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 pb-16 pt-20 md:pt-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-9 w-9 text-red-600" aria-hidden />
        </div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-[var(--heading-color)] md:text-3xl">
          Payment did not go through
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-neutral-600 md:text-base">
          Your order is saved. You can try paying again from checkout, or go home and pay later from{" "}
          <span className="font-medium text-neutral-800">My orders</span>.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={payAgainHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <CreditCard size={18} />
            Pay again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            <Home size={18} />
            Home
          </Link>
        </div>
        {orderId && (
          <Link
            href={`/order/${orderId}`}
            className="mt-6 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View order details
          </Link>
        )}
      </div>
    </div>
  );
}
