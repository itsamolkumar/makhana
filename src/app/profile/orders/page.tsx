"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/types";
import { Package, Clock, CheckCircle, XCircle, ChevronRight, ShoppingBag } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import AuthLoading from "@/components/AuthLoading";

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Require authentication
  const { isChecking, isAuthorized } = useRequireAuth("/profile/orders");

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
        const data = await res.json();
        
        if (res.ok) {
          setOrders(data.data.orders);
        } else {
          setError(data.message || "Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("An unexpected error occurred while fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthorized]);

  if (isChecking) {
    return <AuthLoading 
      message="Verifying your session..." 
      description="Please wait while we confirm your login status"
    />;
  }

  if (!isAuthorized) {
    return <AuthLoading 
      message="Redirecting to login..."
      description="Please login to view your orders"
      loginUrl="/login?redirectTo=/profile/orders"
    />;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "delivered":
        return { color: "text-green-700", bg: "bg-green-100", icon: <CheckCircle size={16} className="mr-1.5" />, label: "Delivered" };
      case "shipped":
        return { color: "text-blue-700", bg: "bg-blue-100", icon: <Package size={16} className="mr-1.5" />, label: "Shipped" };
      case "cancelled":
        return { color: "text-red-700", bg: "bg-red-100", icon: <XCircle size={16} className="mr-1.5" />, label: "Cancelled" };
      default:
        return { color: "text-yellow-700", bg: "bg-yellow-100", icon: <Clock size={16} className="mr-1.5" />, label: "Processing" };
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-[var(--color-primary)]" size={32} />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2 text-lg">View and track your previous orders</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-[var(--color-primary)] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center shadow-sm">
            <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 font-medium transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't placed any orders yet. Start exploring our delicious and healthy products!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 font-medium transition-transform hover:scale-105 shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.orderStatus || "processing");
              
              return (
                <div 
                  key={order._id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">Order #{order._id?.slice(-8).toUpperCase()}</p>
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt || "").toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' 
                        })}
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider font-medium">Total Amount</p>
                      <p className="font-bold text-gray-900 text-lg">₹{order.totalPrice}</p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="flex -space-x-4 mb-3">
                          {order.orderItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="relative w-14 h-14 rounded-xl border-2 border-white bg-gray-50 flex-shrink-0 z-10 overflow-hidden shadow-sm">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.orderItems.length > 3 && (
                            <div className="relative w-14 h-14 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                              <span className="text-sm font-medium text-gray-600">+{order.orderItems.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                          {order.orderItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0 border-gray-50 flex-shrink-0">
                        <Link
                          href={`/order/${order._id}`}
                          className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all group"
                        >
                          View Details
                          <ChevronRight size={16} className="ml-1 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
