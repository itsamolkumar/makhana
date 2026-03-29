"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, Clock3, PackageCheck, RefreshCw, Truck, XCircle } from "lucide-react";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = (params as any)?.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [updatingMethod, setUpdatingMethod] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const paymentFlowState = searchParams.get("payment");

  const isOnlineMethod = (m: string) => m === "razorpay" || m === "upi" || m === "netbanking";

  const syncPaymentChoice = (o: any) => {
    if (!o) return "razorpay" as const;
    return isOnlineMethod(o.paymentMethod) ? ("razorpay" as const) : ("cod" as const);
  };

  const [paymentChoice, setPaymentChoice] = useState<"razorpay" | "cod">("razorpay");

  const fetchOrder = async (showLoader = false) => {
    if (!orderId) return;

    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        const nextOrder = data.data.order;
        setOrder(nextOrder);
        setPaymentChoice(syncPaymentChoice(nextOrder));
        setError(null);
        setLastSyncedAt(new Date().toISOString());
      } else {
        setError(data.message || "Order not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order");
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setPaying(false);
        return;
      }

      const createRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: order.totalPrice }),
      });

      const orderDataResult = await createRes.json();
      
      if (!createRes.ok) {
        toast.error(orderDataResult?.message || "Failed to initialize payment");
        setPaying(false);
        return;
      }

      const { orderId: rzp_order_id, amount, keyId } = orderDataResult.data;

      const options = {
        key: keyId, 
        amount: amount.toString(),
        currency: "INR",
        name: "HealtheBites",
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        image: "/makhana-premium1.png", 
        order_id: rzp_order_id,
        handler: async function (response: any) {
          try {
             toast.loading("Verifying payment...", { id: "verify-toast" }); // Better UX
             const verifyRes = await fetch("/api/payment/verify", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_signature: response.razorpay_signature,
                 dbOrderId: order._id
               })
             });
             
             if (verifyRes.ok) {
               setOrder((prev: any) =>
                 prev
                   ? {
                       ...prev,
                       paymentStatus: "paid",
                       paymentId: response.razorpay_payment_id,
                     }
                   : prev
               );
               toast.success("Payment successful!", { id: "verify-toast" });
               router.replace(`/order/${order._id}?payment=success`);
             } else {
               const errorData = await verifyRes.json();
               toast.error(errorData?.message || "Payment verification failed", { id: "verify-toast" });
               await fetch("/api/payment/fail", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ dbOrderId: order._id, error_description: "Signature mismatch" })
               });
               setOrder((prev: any) => (prev ? { ...prev, paymentStatus: "failed" } : prev));
               setPaying(false);
               router.replace(`/order/${order._id}?payment=failed`);
             }
          } catch (error) {
             console.error("Verification error", error);
             toast.error("An error occurred during verification", { id: "verify-toast" });
             setPaying(false);
             router.replace(`/order/${order._id}?payment=failed`);
          }
        },
        prefill: {
          name: order.shippingAddress.fullName,
          contact: order.shippingAddress.mobile,
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: async function() {
            setPaying(false);
            toast("Payment window closed. Your order is still pending.");
            router.replace(`/order/${order._id}?payment=cancelled`);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", async function (response: any) {
           toast.error(response.error.description || "Payment failed");
           setPaying(false);
           await fetch("/api/payment/fail", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ 
                  dbOrderId: order._id, 
                  error_description: response.error.description,
                  razorpay_payment_id: response.error.metadata?.payment_id
               })
           });
           setOrder((prev: any) => (prev ? { ...prev, paymentStatus: "failed" } : prev));
           paymentObject.close();
           router.replace(`/order/${order._id}?payment=failed`);
      });
      paymentObject.open();

    } catch (error) {
       console.error(error);
       toast.error("Something went wrong");
       setPaying(false);
    }
  };

  const applyPaymentMethod = async (method: "razorpay" | "cod") => {
    if (!order?._id || updatingMethod) return;
    const current = syncPaymentChoice(order);
    if (method === current) return;

    setUpdatingMethod(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/payment-method`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Could not update payment option");
        return;
      }
      setOrder(data.data.order);
      setPaymentChoice(method);
      toast.success(
        method === "cod"
          ? "You chose Cash on Delivery. Pay when your order arrives."
          : "You chose online payment. Complete payment below when you are ready."
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpdatingMethod(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    void fetchOrder(true);
  }, [orderId]);

  useEffect(() => {
    if (!order?._id) return;
    if (["delivered", "cancelled", "returned"].includes(order.orderStatus)) return;

    const intervalId = window.setInterval(() => {
      void fetchOrder(false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [order?._id, order?.orderStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-xl">
          <h2 className="text-2xl font-semibold mb-4">{error || "Order not found"}</h2>
          <button
            onClick={() => router.push("/shop")}
            className="mt-4 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = () => {
    if (order.orderStatus === "delivered") {
      return <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">Delivered</span>;
    }
    if (order.orderStatus === "shipped") {
      return <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-accent)]/15 text-[var(--heading-color)]">Shipped</span>;
    }
    if (order.orderStatus === "cancelled") {
      return <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full">Cancelled</span>;
    }
    return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Processing</span>;
  };

  const subtotalVal = typeof order.subtotal === "number" ? order.subtotal : 0;
  const taxVal = typeof order.tax === "number" ? order.tax : 0;
  const couponDisc = typeof order.couponDiscount === "number" ? order.couponDiscount : 0;
  const gstRate = typeof order.gstRate === "number" ? order.gstRate : 0.18;
  const serviceChargeVal = typeof order.serviceCharge === "number" ? order.serviceCharge : 0;
  const deliveryChargeVal = typeof order.shippingPrice === "number" ? order.shippingPrice : 0;
  const terminalOrder = ["delivered", "cancelled", "returned"].includes(order.orderStatus || "");
  const timeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
  const sortedTimeline = [...timeline].sort(
    (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const statusMeta: Record<string, { label: string; detail: string; icon: typeof Clock3; chip: string }> = {
    confirmed: {
      label: "Order confirmed",
      detail: "We received your order and started preparing it.",
      icon: CheckCircle2,
      chip: "border-[#d7c19a] bg-[#f7efe1] text-[var(--color-primary)]",
    },
    processing: {
      label: "Preparing your items",
      detail: "Your order is being packed and checked.",
      icon: PackageCheck,
      chip: "border-[#d7c19a] bg-[#fbf1df] text-[#8a6935]",
    },
    shipped: {
      label: "Order shipped",
      detail: "Your package is on the way.",
      icon: Truck,
      chip: "border-[#cdd9cf] bg-[#eef4ef] text-[var(--color-primary)]",
    },
    out_for_delivery: {
      label: "Out for delivery",
      detail: "The delivery partner should reach you soon.",
      icon: Truck,
      chip: "border-[#c7d4cc] bg-[#e8f0ea] text-[var(--color-primary)]",
    },
    delivered: {
      label: "Delivered",
      detail: "Your order has been delivered successfully.",
      icon: CheckCircle2,
      chip: "border-[#cdd9cf] bg-[#edf4ee] text-[var(--color-primary)]",
    },
    cancelled: {
      label: "Order cancelled",
      detail: "This order was cancelled before completion.",
      icon: XCircle,
      chip: "border-[#e6c9c1] bg-[#fbefec] text-[#8b4b3e]",
    },
    returned: {
      label: "Order returned",
      detail: "This order has been marked as returned.",
      icon: XCircle,
      chip: "border-[#ddd4c8] bg-[#f4efe8] text-[var(--heading-color)]",
    },
  };
  const activeStatusMeta = statusMeta[order.orderStatus] || statusMeta.confirmed;
  const ActiveStatusIcon = activeStatusMeta.icon;
  const trackingSteps = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
  const activeStepIndex = trackingSteps.indexOf(order.orderStatus);
  const progressPercent = activeStepIndex >= 0 ? ((activeStepIndex + 1) / trackingSteps.length) * 100 : 0;
  const showProgressRail = !["cancelled", "returned"].includes(order.orderStatus);
  const estimatedDeliveryText = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString(undefined, { dateStyle: "medium" })
    : null;
  const paymentBanner = (() => {
    if (paymentFlowState === "success") {
      return {
        tone: "success",
        title: "Payment completed",
        description: "Your online payment was verified successfully. We have started processing your order.",
      };
    }
    if (paymentFlowState === "failed") {
      return {
        tone: "danger",
        title: "Payment failed",
        description: "Your order is still saved. Retry online payment below or switch to Cash on Delivery.",
      };
    }
    if (paymentFlowState === "cancelled") {
      return {
        tone: "warning",
        title: "Payment not completed",
        description: "You closed the payment window before finishing. The order is still active and waiting for your decision.",
      };
    }
    if (paymentFlowState === "setup_failed") {
      return {
        tone: "warning",
        title: "Payment setup could not start",
        description: "Your order was created, but the payment session could not be opened. You can retry or switch to COD below.",
      };
    }
    if (paymentFlowState === "cod") {
      return {
        tone: "info",
        title: "Order placed with COD",
        description: "Your order is confirmed for Cash on Delivery. If you prefer, you can still switch to online payment before dispatch.",
      };
    }
    if (order.paymentStatus === "failed") {
      return {
        tone: "danger",
        title: "Payment still pending",
        description: "Your last online payment attempt did not complete. Retry below or switch to COD.",
      };
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-[#faf9f6] px-3 py-8 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
              {order.orderNumber ? `Order ${order.orderNumber}` : `Order #${String(order._id).slice(-8).toUpperCase()}`}
            </h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Placed on{" "}
              {new Date(order.createdAt || "").toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {statusBadge()}
            <Link
              href="/shop"
              className="rounded-full border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 sm:px-4 sm:text-sm"
            >
              Continue shopping
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="order-2 space-y-4 sm:space-y-6 lg:order-1 lg:col-span-2">
            {paymentBanner && (
              <div
                className={`rounded-2xl border p-4 sm:p-5 ${
                  paymentBanner.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                    : paymentBanner.tone === "danger"
                      ? "border-red-200 bg-red-50 text-red-950"
                      : paymentBanner.tone === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-950"
                      : "border-[#d7c19a] bg-[#f7efe1] text-[var(--heading-color)]"
                }`}
              >
                <p className="font-semibold">{paymentBanner.title}</p>
                <p className="mt-1 text-sm opacity-90">{paymentBanner.description}</p>
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-[#e5d8c4] bg-[linear-gradient(135deg,#f8f1e6_0%,#f4eadc_48%,#efe2cf_100%)] p-4 text-[var(--heading-color)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dcc7a0] bg-white/80 text-[#8a6935] shadow-[0_10px_30px_rgba(200,169,110,0.18)]">
                      <ActiveStatusIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9c8560]">Order tracking</p>
                      <p className="mt-1 text-lg font-semibold leading-tight sm:text-2xl">{activeStatusMeta.label}</p>
                      <p className="mt-1 text-sm text-[var(--color-text)]/80">{activeStatusMeta.detail}</p>
                    </div>
                  </div>
                  <div className="flex justify-start sm:justify-end">
                    <button
                      type="button"
                      onClick={() => void fetchOrder(false)}
                      disabled={refreshing}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d9c7aa] bg-white px-3 py-2 text-xs font-medium text-[var(--heading-color)] shadow-sm transition hover:bg-[#fbf5ec] disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#e4d7c3] bg-white/85 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9c8560]">Payment</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--heading-color)]">
                      {order.paymentStatus === "paid" ? "Paid online" : paymentChoice === "cod" ? "Cash on delivery" : "Awaiting payment"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e4d7c3] bg-white/85 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9c8560]">Estimated delivery</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--heading-color)]">{estimatedDeliveryText || "Updating soon"}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e4d7c3] bg-white/85 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9c8560]">Live sync</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--heading-color)]">
                      {lastSyncedAt
                        ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                        : "Enabled"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {showProgressRail ? (
                  <div className="rounded-3xl border border-slate-100 bg-[#f7fbff] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Shipment progress</p>
                        <p className="mt-1 text-xs text-slate-500">Follow each milestone like a marketplace order tracker.</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {Math.max(progressPercent, 20).toFixed(0)}% complete
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 sm:hidden">
                      {trackingSteps.map((step, index) => {
                        const meta = statusMeta[step];
                        const completed = activeStepIndex >= index;
                        const current = order.orderStatus === step;
                        const StepIcon = meta.icon;

                        return (
                          <div key={step} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-4 bg-white ${
                                  completed
                                    ? "border-emerald-400 text-emerald-600"
                                    : "border-slate-200 text-slate-400"
                                }`}
                              >
                                <StepIcon className="h-4 w-4" />
                              </div>
                              {index !== trackingSteps.length - 1 && (
                                <div className={`mt-1 h-10 w-1 rounded-full ${completed ? "bg-emerald-300" : "bg-slate-200"}`} />
                              )}
                            </div>
                            <div
                              className={`min-w-0 flex-1 rounded-2xl px-3 py-3 ${
                                current
                                  ? "bg-sky-50 text-sky-900 ring-1 ring-sky-200"
                                  : completed
                                    ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                                    : "bg-white text-slate-500 ring-1 ring-slate-200"
                              }`}
                            >
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                                Step {index + 1}
                              </p>
                              <p className="mt-1 text-sm font-semibold leading-snug">{meta.label}</p>
                              <p className="mt-1 text-xs leading-5 opacity-80">{meta.detail}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="relative mt-5 hidden overflow-x-auto pb-2 sm:block">
                      <div className="relative min-w-[560px]">
                        <div className="absolute left-6 right-6 top-5 h-1 rounded-full bg-slate-200" />
                        <div
                          className="absolute left-6 top-5 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
                          style={{ width: `calc(${Math.max(progressPercent, 20)}% - 3rem)` }}
                        />

                        <div className="relative grid grid-cols-5 gap-3">
                          {trackingSteps.map((step, index) => {
                            const meta = statusMeta[step];
                            const completed = activeStepIndex >= index;
                            const current = order.orderStatus === step;
                            const StepIcon = meta.icon;

                            return (
                              <div key={step} className="flex flex-col items-center text-center">
                                <div
                                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 bg-white ${
                                    completed
                                      ? "border-emerald-400 text-emerald-600"
                                      : "border-slate-200 text-slate-400"
                                  }`}
                                >
                                  <StepIcon className="h-4 w-4" />
                                </div>
                                <div
                                  className={`mt-3 w-full rounded-2xl px-2 py-3 ${
                                    current
                                      ? "bg-sky-50 text-sky-900 ring-1 ring-sky-200"
                                      : completed
                                        ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                                        : "bg-white text-slate-500 ring-1 ring-slate-200"
                                  }`}
                                >
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                                    Step {index + 1}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold leading-snug">{meta.label}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-900">
                    <p className="font-semibold">{activeStatusMeta.label}</p>
                    <p className="mt-1 text-red-800/90">{activeStatusMeta.detail}</p>
                  </div>
                )}

                <div className="mt-5 rounded-3xl border border-slate-100 bg-[#fbfcfe] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Latest updates</p>
                      <p className="mt-1 text-xs text-slate-500">Every admin status change appears here automatically.</p>
                    </div>
                    {!terminalOrder && (
                      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <Clock3 className="h-3.5 w-3.5" />
                        Auto refresh 15s
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {sortedTimeline.length > 0 ? (
                      sortedTimeline.map((entry: any, index: number) => {
                        const meta = statusMeta[entry.status] || statusMeta.confirmed;
                        const EntryIcon = meta.icon;
                        const isLatest = index === 0;

                        return (
                          <div
                            key={`${entry.status}-${entry.timestamp}-${index}`}
                            className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm ${
                              isLatest ? "border-sky-200 shadow-sky-100/70" : "border-slate-200"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="relative flex flex-col items-center">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${meta.chip} sm:h-10 sm:w-10`}>
                                  <EntryIcon className="h-4 w-4" />
                                </div>
                                {index !== sortedTimeline.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
                                  {isLatest && (
                                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                                      Latest
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                  {new Date(entry.timestamp).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </p>
                                {entry.description && <p className="mt-2 text-sm leading-6 text-slate-700">{entry.description}</p>}
                                {entry.location && (
                                  <p className="mt-2 text-xs font-medium text-slate-500">Location: {entry.location}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                        Tracking updates will start appearing here once the order moves to the next stage.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <p className="text-gray-700">
                {order.shippingAddress.fullName} • {order.shippingAddress.mobile}
              </p>
              <p className="text-gray-700">
                {order.shippingAddress.area}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              {order.shippingAddress.landmark && (
                <p className="text-gray-700">Landmark: {order.shippingAddress.landmark}</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl">Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item: any, index: number) => (
                  <div key={`item-${index}`} className="flex gap-3 sm:gap-4">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover sm:h-16 sm:w-16" />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 sm:h-16 sm:w-16" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                      <p className="text-xs text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-semibold sm:text-xl">Order summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">Rs {subtotalVal.toFixed(2)}</span>
              </div>
              {order.couponCode && couponDisc > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({order.couponCode})</span>
                  <span>-Rs {couponDisc.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST ({(gstRate * 100).toFixed(0)}%)</span>
                <span className="font-medium text-gray-900">Rs {taxVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service charge</span>
                <span className="font-medium">Rs {serviceChargeVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery charge</span>
                <span className="font-medium">Rs {deliveryChargeVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold text-gray-900">
                <span>Total payable</span>
                <span>Rs {Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            {order.paymentMethod === "cod" &&
              order.paymentStatus !== "paid" &&
              !["cancelled", "delivered", "returned"].includes(order.orderStatus || "") && (
                <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                  <p className="mt-1 text-emerald-800/90">
                    Switch to online payment below. Your total already includes GST, service, and delivery charges.
                  </p>
                </div>
              )}

            {order.paymentStatus !== "paid" &&
              !["cancelled", "delivered", "returned"].includes(order.orderStatus || "") && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-sm">
                    <p className="font-medium mb-1">Payment not completed yet</p>
                    <p className="text-amber-800/90">
                      Choose how you want to pay. You can switch between online payment and cash on delivery
                      before you complete the order.
                    </p>
                  </div>

                  <fieldset disabled={updatingMethod} className="space-y-3">
                    <legend className="text-sm font-semibold text-gray-800 mb-2">How would you like to pay?</legend>
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-green-50/50">
                      <input
                        type="radio"
                        name="paymode"
                        className="mt-1"
                        checked={paymentChoice === "razorpay"}
                        onChange={() => void applyPaymentMethod("razorpay")}
                      />
                      <span>
                        <span className="font-medium text-gray-900">Pay online</span>
                        <span className="block text-xs text-gray-600 mt-0.5">UPI, card, or net banking via secure payment</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-green-50/50">
                      <input
                        type="radio"
                        name="paymode"
                        className="mt-1"
                        checked={paymentChoice === "cod"}
                        onChange={() => void applyPaymentMethod("cod")}
                      />
                      <span>
                        <span className="font-medium text-gray-900">Cash on delivery (COD)</span>
                        <span className="block text-xs text-gray-600 mt-0.5">Pay with cash when your order is delivered</span>
                      </span>
                    </label>
                  </fieldset>

                  {updatingMethod && (
                    <p className="text-sm text-gray-500">Updating your choice…</p>
                  )}

                  {paymentChoice === "razorpay" && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={paying || updatingMethod}
                        className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
                      >
                        {paying ? "Opening payment..." : "Pay now (secure)"}
                      </button>
                      <p className="text-xs text-gray-500">
                        If you open the payment window and then change your mind, close it and switch back to COD here.
                      </p>
                    </div>
                  )}

                  {paymentChoice === "cod" && !updatingMethod && (
                    <p className="text-sm text-gray-600 text-center bg-gray-50 rounded-xl py-3 px-2">
                      No online payment needed. Your order will be processed as{" "}
                      <span className="font-medium text-gray-900">cash on delivery</span>.
                    </p>
                  )}
                </div>
              )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

