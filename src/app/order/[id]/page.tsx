"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { GST_RATE } from "@/lib/pricing";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params as any)?.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [updatingMethod, setUpdatingMethod] = useState(false);

  const isOnlineMethod = (m: string) => m === "razorpay" || m === "upi" || m === "netbanking";

  const syncPaymentChoice = (o: any) => {
    if (!o) return "razorpay" as const;
    return isOnlineMethod(o.paymentMethod) ? ("razorpay" as const) : ("cod" as const);
  };

  const [paymentChoice, setPaymentChoice] = useState<"razorpay" | "cod">("razorpay");

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
               toast.success("Payment successful!", { id: "verify-toast" });
               router.push(`/order/confirmed/${order._id}?paid=1`);
             } else {
               const errorData = await verifyRes.json();
               toast.error(errorData?.message || "Payment verification failed", { id: "verify-toast" });
               await fetch("/api/payment/fail", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ dbOrderId: order._id, error_description: "Signature mismatch" })
               });
               setPaying(false);
               router.push(`/payment/failed?orderId=${order._id}`);
             }
          } catch (error) {
             console.error("Verification error", error);
             toast.error("An error occurred during verification", { id: "verify-toast" });
             setPaying(false);
             router.push(`/payment/failed?orderId=${order._id}`);
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
            toast.error("Payment cancelled.");
            await fetch("/api/payment/fail", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ dbOrderId: order._id, error_description: "User closed modal" })
            });
            router.push(`/payment/failed?orderId=${order._id}`);
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
           paymentObject.close();
           router.push(`/payment/failed?orderId=${order._id}`);
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

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (res.ok) {
          const o = data.data.order;
          setOrder(o);
          setPaymentChoice(syncPaymentChoice(o));
        } else {
          setError(data.message || "Order not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
      return <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Shipped</span>;
    }
    if (order.orderStatus === "cancelled") {
      return <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full">Cancelled</span>;
    }
    return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Processing</span>;
  };

  const subtotalVal = typeof order.subtotal === "number" ? order.subtotal : 0;
  const taxVal = typeof order.tax === "number" ? order.tax : 0;
  const couponDisc = typeof order.couponDiscount === "number" ? order.couponDiscount : 0;

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
                <span className="font-medium text-gray-900">₹{subtotalVal.toFixed(2)}</span>
              </div>
              {order.couponCode && couponDisc > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({order.couponCode})</span>
                  <span>−₹{couponDisc.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST ({GST_RATE * 100}%)</span>
                <span className="font-medium text-gray-900">₹{taxVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold text-gray-900">
                <span>Total (incl. GST)</span>
                <span>₹{Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            {order.paymentMethod === "cod" &&
              order.paymentStatus !== "paid" &&
              !["cancelled", "delivered", "returned"].includes(order.orderStatus || "") && (
                <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">Pay securely online</p>
                  <p className="mt-1 text-emerald-800/90">
                    Switch to online payment below — amount includes {GST_RATE * 100}% GST (same as your order total).
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
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={paying || updatingMethod}
                      className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {paying ? "Opening payment…" : "Pay now (secure)"}
                    </button>
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
