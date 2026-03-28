"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Home } from "lucide-react";

export default function OrderConfirmedPage() {
  const params = useParams();
  const id = params?.id as string;
  const [paid, setPaid] = useState(false);
  const [method, setMethod] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setPaid(q.get("paid") === "1");
    setMethod(q.get("method"));
  }, []);
  const [order, setOrder] = useState<{ orderNumber?: string; totalPrice?: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.order) setOrder(d.data.order);
      })
      .catch(() => {});
  }, [id]);

  const subtitle =
    paid === true
      ? "Your payment was successful and your order is confirmed."
      : method === "cod"
        ? "Your order is placed. Pay with cash when it arrives."
        : "Your order has been placed successfully.";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 pb-16 pt-20 md:pt-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-neutral-100 bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle className="h-9 w-9 text-[var(--color-primary)]" aria-hidden />
        </div>
        <h1 className="mb-2 font-serif text-2xl font-bold text-[var(--heading-color)] md:text-3xl">
          Order confirmed
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-600 md:text-base">{subtitle}</p>

        {order?.orderNumber && (
          <p className="mb-2 font-mono text-sm text-neutral-500">#{order.orderNumber}</p>
        )}
        {order?.totalPrice != null && (
          <p className="mb-8 text-lg font-semibold text-neutral-900">Total ₹{order.totalPrice}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={id ? `/order/${id}` : "/profile/orders"}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            <Package size={18} />
            View order
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Home size={18} />
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
