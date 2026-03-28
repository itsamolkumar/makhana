"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Order } from "@/types";
import toast from "react-hot-toast";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params as any)?.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

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
               window.location.reload();
             } else {
               const errorData = await verifyRes.json();
               toast.error(errorData?.message || "Payment verification failed", { id: "verify-toast" });
               await fetch("/api/payment/fail", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ dbOrderId: order._id, error_description: "Signature mismatch" })
               });
               setPaying(false);
               window.location.reload();
             }
          } catch (error) {
             console.error("Verification error", error);
             toast.error("An error occurred during verification", { id: "verify-toast" });
             setPaying(false);
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
            window.location.reload();
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
      });
      paymentObject.open();

    } catch (error) {
       console.error(error);
       toast.error("Something went wrong");
       setPaying(false);
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
          setOrder(data.data.order);
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

  return (
    <div className="min-h-screen bg-[#faf9f6] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order._id}</h1>
            <p className="text-sm text-gray-600 mt-1">Placed on {new Date(order.createdAt || "").toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge()}
            <Link
              href="/shop"
              className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item: any, index: number) => (
                  <div key={`item-${index}`} className="flex items-center gap-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                      <p className="text-xs text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.totalPrice + (order.couponDiscount || 0)}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({order.couponCode})</span>
                  <span>–₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>

            {order.paymentMethod === "razorpay" && order.paymentStatus !== "paid" && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-orange-50 text-orange-800 p-4 rounded-xl mb-4 text-sm font-medium">
                  Payment is pending or failed. Please complete your payment to process this order.
                </div>
                <button
                  onClick={handlePayNow}
                  disabled={paying}
                  className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {paying ? "Loading..." : "Pay Now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
