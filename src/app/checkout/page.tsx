"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import AuthLoading from "@/components/AuthLoading";
import MapAddressSelector from "@/components/MapAddressSelector";
import { clearCart } from "@/redux/slices/cartSlice";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_PRICING_SETTINGS,
  computeOrderTotals,
  normalizePricingSettings,
  type PricingSettings,
} from "@/lib/pricing";
import Link from "next/link";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface Address {
  _id?: string;
  fullName: string;
  mobile: string;
  pincode: string;
  state: string;
  city: string;
  area: string;
  landmark?: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const { items, subtotal, discount, appliedCoupon: cartCoupon } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { confirm } = useConfirm();
  const [payOrderId, setPayOrderId] = useState<string | null>(null);
  const [payOrder, setPayOrder] = useState<any>(null);
  const [payOrderLoading, setPayOrderLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(
    DEFAULT_PRICING_SETTINGS
  );

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setPayOrderId(q.get("payOrder"));
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("=== CHECKOUT PAGE ===");
    console.log("User from Redux:", user);
    console.log("User addresses from Redux:", user?.addresses);
    console.log("User addresses length:", user?.addresses?.length);
  }, [user]);

  // Require authentication
  const { isChecking, isAuthorized } = useRequireAuth("/checkout");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const effectiveDiscount = appliedCoupon ? couponDiscount : discount;
  const { taxable, gst: gstAmount, total: totalDue, serviceCharge, deliveryCharge } = useMemo(
    () => computeOrderTotals(subtotal, effectiveDiscount, pricingSettings),
    [subtotal, effectiveDiscount, pricingSettings]
  );

  // Address form state
  const [addressForm, setAddressForm] = useState<Address>({
    fullName: user?.name || "",
    mobile: user?.mobile || "",
    pincode: "",
    state: "",
    city: "",
    area: "",
    landmark: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod" | "upi" | "netbanking">("cod");
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Log whenever addresses state changes
  useEffect(() => {
    console.log("=== ADDRESSES STATE CHANGED ===");
    console.log("Addresses state now:", addresses);
    console.log("Addresses count:", addresses.length);
    console.log("Selected address index:", selectedAddress);
  }, [addresses]);

  // Redirect to cart if no items (skip when paying an existing order)
  useEffect(() => {
    const loadPricingSettings = async () => {
      try {
        const res = await fetch("/api/store-settings", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.data?.settings) {
          setPricingSettings(normalizePricingSettings(data.data.settings));
        }
      } catch {
        // Checkout falls back to defaults if pricing config is unavailable.
      }
    };

    void loadPricingSettings();
  }, []);

  useEffect(() => {
    if (payOrderId || currentOrderId) return;
    if (items.length === 0 && isAuthorized && !placingOrder) {
      router.push("/cart");
    }
  }, [items.length, isAuthorized, placingOrder, router, payOrderId, currentOrderId]);

  // Load existing order for "pay again" flow
  useEffect(() => {
    if (!payOrderId || !isAuthorized) return;
    setPayOrderLoading(true);
    fetch(`/api/orders/${payOrderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.order) {
          setPayOrder(d.data.order);
        } else {
          toast.error(d.message || "Order not found");
        }
      })
      .catch(() => toast.error("Could not load order"))
      .finally(() => setPayOrderLoading(false));
  }, [payOrderId, isAuthorized]);

  // Load user addresses when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchUserAddresses();
    }
  }, [isAuthorized, user]);

  const fetchUserAddresses = async () => {
    try {
      console.log("========== fetchUserAddresses STARTED ==========");
      console.log("Called at:", new Date().toLocaleTimeString());
      console.log("User object:", user);
      console.log("User addresses from Redux:", user?.addresses);
      
      console.log("Fetching from /api/user/addresses...");
      const res = await fetch("/api/user/addresses");
      const data = await res.json();
      
      console.log("API Response status:", res.status);
      console.log("API Response OK:", res.ok);
      console.log("Full API Response:", data);
      
      if (res.ok) {
        // Handle both data.addresses and data.data.addresses
        const addressList = data.addresses || data.data?.addresses || [];
        console.log("Extracted addressList:", addressList);
        console.log("Address list length:", addressList?.length);
        
        if (addressList && addressList.length > 0) {
          console.log(`✓ Found ${addressList.length} addresses from API`);
          console.log("Setting addresses state to:", addressList);
          setAddresses(addressList);
          
          // Set default address if available, otherwise select the first one
          const defaultAddr = addressList.find((addr: Address) => addr.isDefault);
          if (defaultAddr) {
            console.log("✓ Found default address:", defaultAddr);
            setSelectedAddress(addressList.indexOf(defaultAddr).toString());
          } else {
            console.log("✓ No default address found, selecting first (index 0)");
            setSelectedAddress("0");
          }
        } else {
          console.warn("✗ No addresses found in API response (empty array)");
          setAddresses([]);
          setSelectedAddress("");
        }
      } else {
        console.error("✗ API returned error:", res.status, data);
        setAddresses([]);
        setSelectedAddress("");
      }
      console.log("========== fetchUserAddresses COMPLETED ==========\n");
    } catch (error) {
      console.error("✗ Exception in fetchUserAddresses:", error);
      setAddresses([]);
      setSelectedAddress("");
    }
  };

  const handleAddAddress = async () => {
    // Validate all required fields
    if (!addressForm.fullName?.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!addressForm.mobile?.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (!addressForm.pincode?.trim()) {
      toast.error("Pincode is required");
      return;
    }
    if (!addressForm.state?.trim()) {
      toast.error("State is required");
      return;
    }
    if (!addressForm.city?.trim()) {
      toast.error("City is required");
      return;
    }
    if (!addressForm.area?.trim()) {
      toast.error("Area/Street is required");
      return;
    }

    // Validate mobile (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(addressForm.mobile.replace(/\D/g, ""))) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(addressForm.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const method = editingAddressId ? "PUT" : "POST";
      const url = editingAddressId 
        ? `/api/user/addresses/${editingAddressId}`
        : "/api/user/addresses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(editingAddressId ? "Address updated successfully" : "Address added successfully");
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm({
          fullName: user?.name || "",
          mobile: user?.mobile || "",
          pincode: "",
          state: "",
          city: "",
          area: "",
          landmark: "",
        });
        fetchUserAddresses();
      } else {
        toast.error(data?.message || "Failed to save address");
      }
    } catch (error: any) {
      console.error("Address error:", error);
      toast.error(error?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address: any, index: number) => {
    setEditingAddressId(address._id || index);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string, index: number) => {
    const accepted = await confirm({
      title: "Delete this address?",
      description: "This saved address will be removed from your account.",
      confirmText: "Delete address",
      cancelText: "Keep it",
      tone: "danger",
    });
    if (!accepted) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/user/addresses/${addressId || index}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Address deleted successfully");
        fetchUserAddresses();
        if (selectedAddress === index.toString()) {
          setSelectedAddress("");
        }
      } else {
        toast.error(data?.message || "Failed to delete address");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || "",
      mobile: user?.mobile || "",
      pincode: "",
      state: "",
      city: "",
      area: "",
      landmark: "",
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.data);
        setCouponDiscount(data.data.discount);
        toast.success("Coupon applied successfully!");
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    toast.success("Coupon removed");
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

  const redirectToOrder = (orderId: string, paymentState?: string) => {
    const params = new URLSearchParams();
    if (paymentState) {
      params.set("payment", paymentState);
    }
    router.replace(`/order/${orderId}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    setPlacingOrder(true);
    try {
      const shippingAddress = addresses[Number(selectedAddress)];
      const unitPrice = (p: (typeof items)[0]["product"]) =>
        (p.discountPrice != null && p.discountPrice < p.price ? p.discountPrice : p.price) as number;
      const orderData = {
        orderItems: items.map((item) => ({
          product: item.product._id || item.product.id,
          name: item.product.name,
          price: unitPrice(item.product),
          quantity: item.quantity,
          image: item.product.images?.[0],
          sku: item.product.sku,
        })),
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.coupon ?? cartCoupon?.code,
        notes: "",
      };

      // 1. Create order in DB FIRST
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData?.message || "Failed to create order");
        setPlacingOrder(false);
        setLoading(false);
        return;
      }

      const responseData = await res.json();
      const createdOrder = responseData.data.order;
      const dbOrderId = createdOrder._id;
      const amountToCharge = Number(createdOrder.totalPrice);
      setCurrentOrderId(dbOrderId);

      // Order created successfully, clear cart.
      dispatch(clearCart());

      if (paymentMethod === "razorpay") {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Razorpay SDK failed to load. You can finish payment from the order page.");
          redirectToOrder(dbOrderId, "setup_failed");
          setPlacingOrder(false);
          setLoading(false);
          return;
        }

        const createRes = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountToCharge }),
        });

        const orderDataResult = await createRes.json();
        
        if (!createRes.ok) {
          toast.error(orderDataResult?.message || "Failed to initialize payment. You can retry from the order page.");
          redirectToOrder(dbOrderId, "setup_failed");
          setPlacingOrder(false);
          setLoading(false);
          return;
        }

        const { orderId: rzp_order_id, amount, keyId } = orderDataResult.data;

        const options = {
          key: keyId, 
          amount: amount.toString(),
          currency: "INR",
          name: "HealtheBites",
          description: "Makhana Store Purchase",
          image: "/makhana-premium1.png", 
          order_id: rzp_order_id,
          handler: async function (response: any) {
            try {
               toast.loading("Verifying payment...", { id: "verify-toast" });
               const verifyRes = await fetch("/api/payment/verify", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                   razorpay_payment_id: response.razorpay_payment_id,
                   razorpay_order_id: response.razorpay_order_id,
                   razorpay_signature: response.razorpay_signature,
                   dbOrderId: dbOrderId
                 })
               });
               
               if (verifyRes.ok) {
                 toast.success("Payment successful!", { id: "verify-toast" });
                 redirectToOrder(dbOrderId, "success");
               } else {
                 const errorData = await verifyRes.json();
                 toast.error(errorData?.message || "Payment verification failed", { id: "verify-toast" });
                 await fetch("/api/payment/fail", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify({ dbOrderId, error_description: "Signature mismatch" })
                 });
                 redirectToOrder(dbOrderId, "failed");
               }
            } catch (error) {
               console.error("Verification error", error);
               toast.error("An error occurred during verification", { id: "verify-toast" });
               redirectToOrder(dbOrderId, "failed");
            }
          },
          prefill: {
            name: shippingAddress.fullName,
            email: user?.email || "",
            contact: shippingAddress.mobile,
          },
          theme: {
            color: "#16a34a",
          },
          modal: {
            ondismiss: async function() {
              toast("Payment window closed. Your order is still saved and awaiting payment.");
              redirectToOrder(dbOrderId, "cancelled");
            }
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on("payment.failed", async function (response: any) {
             toast.error(response.error.description || "Payment failed");
             await fetch("/api/payment/fail", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ 
                    dbOrderId, 
                    error_description: response.error.description,
                    razorpay_payment_id: response.error.metadata?.payment_id
                 })
             });
             redirectToOrder(dbOrderId, "failed");
             paymentObject.close();
        });
        paymentObject.open();
        setPlacingOrder(false);
        setLoading(false);

      } else {
        toast.success("Order placed successfully!");
        redirectToOrder(dbOrderId, "cod");
        setPlacingOrder(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to process order");
      setPlacingOrder(false);
      setLoading(false);
    }
  };

  const payExistingOrderWithRazorpay = async () => {
    if (!payOrder?._id) return;
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Payment SDK failed to load. You can still manage this order from its order page.");
        return;
      }
      const dbOrderId = payOrder._id;
      const amountToCharge = Number(payOrder.totalPrice);
      const createRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountToCharge }),
      });
      const orderDataResult = await createRes.json();
      if (!createRes.ok) {
        toast.error(orderDataResult?.message || "Failed to start payment");
        return;
      }
      const { orderId: rzp_order_id, amount, keyId } = orderDataResult.data;
      const addr = payOrder.shippingAddress;
      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: "INR",
        name: "HealtheBites",
        description: `Order #${String(dbOrderId).slice(-8)}`,
        image: "/makhana-premium1.png",
        order_id: rzp_order_id,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "verify-toast" });
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId,
              }),
            });
            if (verifyRes.ok) {
              toast.success("Payment successful!", { id: "verify-toast" });
              redirectToOrder(dbOrderId, "success");
            } else {
              toast.error("Verification failed", { id: "verify-toast" });
              await fetch("/api/payment/fail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dbOrderId, error_description: "Verify failed" }),
              });
              redirectToOrder(dbOrderId, "failed");
            }
          } catch {
            redirectToOrder(dbOrderId, "failed");
          }
        },
        prefill: {
          name: addr?.fullName,
          email: user?.email || "",
          contact: addr?.mobile,
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: async function () {
            toast("Payment window closed. Your order is still pending.");
            redirectToOrder(dbOrderId, "cancelled");
          },
        },
      };
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", async function (response: any) {
        await fetch("/api/payment/fail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dbOrderId,
            error_description: response.error?.description,
            razorpay_payment_id: response.error?.metadata?.payment_id,
          }),
        });
        redirectToOrder(dbOrderId, "failed");
        paymentObject.close();
      });
      paymentObject.open();
    } catch {
      toast.error("Could not start payment");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return <AuthLoading 
      message="Verifying your session..." 
      description="Please wait while we confirm your login status"
    />;
  }

  if (!isAuthorized) {
    const backToCheckout = payOrderId
      ? `/checkout?payOrder=${encodeURIComponent(payOrderId)}`
      : "/checkout";
    return (
      <AuthLoading
        message="Redirecting to login..."
        description="Please login to continue with checkout"
        loginUrl={`/login?redirectTo=${encodeURIComponent(backToCheckout)}`}
      />
    );
  }

  if (payOrderId) {
    if (payOrderLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      );
    }
    if (payOrder?.paymentStatus === "paid") {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf9f6] px-4 text-center">
          <p className="text-lg text-neutral-700">This order is already paid.</p>
          <Link href={`/order/${payOrder._id}`} className="text-[var(--color-primary)] font-medium underline">
            View order
          </Link>
          <Link href="/" className="text-sm text-neutral-500">
            Home
          </Link>
        </div>
      );
    }
    if (payOrder) {
      return (
        <div className="min-h-screen bg-[#faf9f6] px-4 py-10">
          <div className="mx-auto max-w-md rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h1 className="mb-2 font-serif text-2xl font-bold text-[var(--heading-color)]">Complete payment</h1>
            <p className="mb-6 text-sm text-neutral-600">
              Pay ₹{payOrder.totalPrice} securely for order #{String(payOrder._id).slice(-8).toUpperCase()}
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void payExistingOrderWithRazorpay()}
              className="mb-4 w-full rounded-full bg-[var(--color-primary)] py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Please wait…" : "Pay now"}
            </button>
            <div className="flex flex-col gap-2 text-center text-sm">
              <Link href={`/order/${payOrder._id}`} className="text-[var(--color-primary)] hover:underline">
                Open full order options
              </Link>
              <Link href={`/order/${payOrder._id}`} className="text-[var(--color-primary)] hover:underline">
                View order details
              </Link>
              <Link href="/" className="text-neutral-500 hover:underline">
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] py-6 sm:py-8 px-3 sm:px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">



            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 w-full overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                Delivery Address
              </h2>

              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Delivery Address:</h3>
                  <div className="space-y-3">
                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedAddress(index.toString())}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition transform hover:shadow-md ${
                          selectedAddress === index.toString()
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md"
                            : "border-gray-200 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-4 w-full min-w-0">
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selectedAddress === index.toString()}
                            onChange={() => setSelectedAddress(index.toString())}
                            className="w-5 h-5 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)] focus:ring-2 mt-0.5 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 truncate">{address.fullName}</p>
                              {address.isDefault && (
                                <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1 truncate">📱 {address.mobile}</p>
                            <p className="text-sm text-gray-700 font-medium break-words">
                              {address.area}, {address.city}
                            </p>
                            <p className="text-sm text-gray-600 break-words">
                              {address.state} - {address.pincode}
                            </p>
                            {address.landmark && (
                              <p className="text-sm text-gray-600 mt-1 break-words">📍 {address.landmark}</p>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-70 hover:opacity-100 transition flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address, index);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address._id || "", index);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state for addresses */}
              {addresses.length === 0 && !showAddressForm && (
                <div className="mb-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Addresses found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    You haven&apos;t added any delivery addresses yet. Please add a new delivery address to proceed with placing your order.
                  </p>
                </div>
              )}

              {/* Add New Address Button */}
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddressId(null);
                    setAddressForm({
                      fullName: user?.name || "",
                      mobile: user?.mobile || "",
                      pincode: "",
                      state: "",
                      city: "",
                      area: "",
                      landmark: "",
                    });
                  }}
                  className="flex items-center gap-2 text-[var(--color-primary)] hover:underline mb-4 font-medium"
                >
                  <Plus size={16} />
                  Add New Address
                </button>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-6 space-y-6"
                >
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-900">
                      {editingAddressId ? "📍 Edit Address" : "📍 Add New Address"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Click on the map or use your current location to auto-fill the address</p>
                    
                    {/* Map Component */}
                    <div className="w-full max-w-full overflow-hidden rounded-xl">
                      <MapAddressSelector
                        onAddressSelect={(address) => {
                          setAddressForm(prev => ({
                            ...prev,
                            state: address.state || prev.state,
                            city: address.city || prev.city,
                            area: address.area || prev.area,
                            pincode: address.pincode || prev.pincode,
                            landmark: address.landmark || prev.landmark,
                          }));
                        }}
                        initialLat={28.6139}
                        initialLng={77.209}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter full name"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={addressForm.mobile}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, mobile: e.target.value }))}
                        placeholder="10 digit mobile number"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Auto-filled from map or enter manually"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Auto-filled from map or enter manually"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area / Street *</label>
                      <input
                        type="text"
                        value={addressForm.area}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, area: e.target.value }))}
                        placeholder="Auto-filled from map or enter manually"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Auto-filled from map or enter manually"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                        placeholder="e.g., Near railway station, Next to church"
                        className="w-full min-w-0 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleAddAddress}
                      disabled={loading}
                      className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : editingAddressId ? (
                        "Update Address"
                      ) : (
                        "Add Address"
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 w-full overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3 sm:gap-4">
                    <img
                      src={item.product.images?.[0] || "/makhana-premium1.png"}
                      alt={item.product.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-contain bg-gray-50 border p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{item.product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{item.product.weight}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm sm:text-base">₹{(item.product.discountPrice || item.product.price) * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 w-full overflow-hidden h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Coupon Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-3">Have a coupon?</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">{appliedCoupon.coupon}</p>
                    <p className="text-sm text-green-600">₹{couponDiscount} discount applied</p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loading || !couponCode.trim()}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && !appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Cart discount</span>
                  <span>-Rs {discount.toFixed(2)}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span>
                  <span>-Rs {couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxable amount</span>
                <span className="font-medium">Rs {taxable.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({(pricingSettings.gstRate * 100).toFixed(0)}%)</span>
                <span className="font-medium">Rs {gstAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Service charge</span>
                <span className="font-medium">Rs {serviceCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery charge</span>
                <span className="font-medium">Rs {deliveryCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total to pay</span>
                <span>Rs {totalDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💳 Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                    className="w-5 h-5 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)] focus:ring-2 mt-0.5 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value as "razorpay")}
                    className="w-5 h-5 text-[var(--color-primary)] bg-gray-100 border-gray-300 focus:ring-[var(--color-primary)] focus:ring-2 mt-0.5 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Online Payment</div>
                    <div className="text-sm text-gray-600">Pay securely with credit/debit card, UPI, or net banking</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
              className="w-full bg-[var(--color-primary)] text-white py-3 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>

            <Link
              href="/cart"
              className="block text-center text-[var(--color-primary)] hover:underline"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

