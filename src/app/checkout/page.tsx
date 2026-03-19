"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearCart } from "@/redux/slices/cartSlice";
import { updateUser } from "@/redux/slices/authSlice";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, CreditCard, Truck, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

interface Address {
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
  const { items, subtotal, discount, total } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(total);

  // Address form state
  const [addressForm, setAddressForm] = useState<Address>({
    fullName: "",
    mobile: "",
    pincode: "",
    state: "",
    city: "",
    area: "",
    landmark: "",
  });

  // User details
  const [userDetails, setUserDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirectTo=/checkout");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    // Load user addresses
    fetchUserAddresses();
  }, [isAuthenticated, items.length, router]);

  useEffect(() => {
    if (!appliedCoupon) {
      setFinalTotal(total);
    }
  }, [total, appliedCoupon]);

  const fetchUserAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        // Set default address if available, otherwise select the first one
        const defaultAddr = data.addresses?.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(data.addresses.indexOf(defaultAddr).toString());
        } else if (data.addresses?.length) {
          setSelectedAddress("0");
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      // Using OpenStreetMap's Nominatim free reverse geocoding
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          // Nominatim recommends providing a user agent for fair use
          "User-Agent": "HealtheBites/1.0 (contact@example.com)",
        },
      });
      const data = await res.json();
      const addr = data.address || {};

      setAddressForm((prev) => ({
        ...prev,
        pincode: addr.postcode || prev.pincode,
        state: addr.state || addr.region || prev.state,
        city: addr.city || addr.town || addr.village || addr.county || prev.city,
        area: addr.road || addr.neighbourhood || addr.suburb || prev.area,
        landmark: addr.neighbourhood || addr.suburb || prev.landmark,
      }));

      toast.success("Address filled from current location");
    } catch (error) {
      console.error("Reverse geocode failed", error);
      toast.error("Unable to resolve address from location");
    }
  };

  const handleLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          toast.success(`Location accessed: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          await reverseGeocode(latitude, longitude);
        },
        (error) => {
          toast.error("Location access denied");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const handleAddAddress = async () => {
    if (!addressForm.fullName || !addressForm.mobile || !addressForm.pincode ||
        !addressForm.state || !addressForm.city || !addressForm.area) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Address added successfully");
        setShowAddressForm(false);
        setAddressForm({
          fullName: "",
          mobile: "",
          pincode: "",
          state: "",
          city: "",
          area: "",
          landmark: "",
        });
        fetchUserAddresses();
      } else {
        const msg = data?.message || "Failed to add address";
        toast.error(msg);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserDetails = async () => {
    if (!userDetails.name || !userDetails.email) {
      toast.error("Please provide name and email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Details updated successfully");
        dispatch(updateUser(userDetails));
      } else {
        toast.error(data.message || "Failed to update details");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update details");
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.data);
        setCouponDiscount(data.data.discount);
        setFinalTotal(data.data.finalPrice);
        toast.success("Coupon applied successfully!");
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setFinalTotal(total);
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = addresses[Number(selectedAddress)];
      const orderData = {
        shippingAddress,
        couponCode: appliedCoupon?.coupon,
        userDetails,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const order = await res.json();
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        router.push(`/order/${order.order._id}`);
      } else {
        toast.error("Failed to place order");
      }
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* User Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={userDetails.mobile}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateUserDetails}
                disabled={loading}
                className="mt-4 bg-[var(--color-primary)] text-white px-6 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                Update Details
              </button>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                Delivery Address
              </h2>

              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  {addresses.map((address, index) => (
                    <label key={index} className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="address"
                        value={index.toString()}
                        checked={selectedAddress === index.toString()}
                        onChange={() => setSelectedAddress(index.toString())}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{address.fullName}</p>
                        <p className="text-sm text-gray-600">{address.mobile}</p>
                        <p className="text-sm text-gray-600">
                          {address.area}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.landmark && <p className="text-sm text-gray-600">{address.landmark}</p>}
                        {address.isDefault && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Default</span>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add New Address Button */}
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-2 text-[var(--color-primary)] hover:underline mb-4"
              >
                <Plus size={16} />
                Add New Address
              </button>

              {/* Address Form */}
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-6"
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        value={addressForm.mobile}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, mobile: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area/Street *</label>
                      <input
                        type="text"
                        value={addressForm.area}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))}
                        className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={handleLocationAccess}
                      className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition"
                    >
                      <MapPin size={16} />
                      Use Current Location
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddAddress}
                      disabled={loading}
                      className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                      Add Address
                    </button>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <img
                      src={item.product.images?.[0] || "/makhana-premium1.png"}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.weight}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(item.product.discountPrice || item.product.price) * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                <span className="font-medium">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cart Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">Free</span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>₹{finalTotal}</span>
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