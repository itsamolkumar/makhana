"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Edit2, Eye, DollarSign, Package, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

const ORDER_STATUSES = ["processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState<any>(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async (opts: { search?: string, status?: string, page?: number } = {}) => {
    setLoading(true);

    const params = new URLSearchParams();
    params.set("all", "true");
    params.set("stats", "true");
    
    const appliedSearch = opts.search ?? searchTerm;
    const appliedStatus = opts.status !== undefined ? opts.status : statusFilter;
    const appliedPage = opts.page || page;
    const limit = 10;

    params.set("page", appliedPage.toString());
    params.set("limit", limit.toString());
    
    if (appliedSearch) params.set("search", appliedSearch);
    if (appliedStatus) params.set("status", appliedStatus);

    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Failed to load orders");
      } else {
        const data = await res.json();
        setOrders(data.data?.orders || []);
        setStats(data.data?.stats);
        setTotalPages(data.data?.pages || 1);
        setTotalOrders(data.data?.total || 0);
        setPage(appliedPage);
      }
    } catch (error: any) {
      toast.error("Failed to load orders: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders({ page: 1 });
  }, []);

  const handleSearch = () => {
    fetchOrders({ search: searchTerm, page: 1 });
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh to get updated stats and list
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update order status");
      }
    } catch (error: any) {
      toast.error("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Delivered</span>;
      case "shipped": return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Package size={12}/> Shipped</span>;
      case "cancelled": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12}/> Cancelled</span>;
      default: return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12}/> Processing</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 text-sm">Monitor and manage all customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString() || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.processingOrders || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.deliveredOrders || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters Base */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID (24 char hex)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchOrders({ status: e.target.value, page: 1 });
            }}
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          
          <button
            onClick={handleSearch}
            className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="text-gray-500 mt-1">Adjust your filters or try a different search term.</p>
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link href={`/order/${order._id}`} className="font-semibold text-[var(--color-primary)] hover:underline">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>
                
                <div className="flex justify-between items-center text-sm border-y border-gray-50 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                    <p className="text-gray-500 text-xs">{order.orderItems?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">₹{order.totalPrice}</p>
                    <p className="text-gray-500 text-xs uppercase">{order.paymentMethod}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <select
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 disabled:opacity-50"
                    value={order.orderStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <Link
                    href={`/order/${order._id}`}
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center bg-white"
                  >
                    <Eye size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Order details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/order/${order._id}`} className="font-medium text-[var(--color-primary)] hover:underline block mb-0.5">
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(order.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.user?.mobile || order.shippingAddress?.mobile}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">₹{order.totalPrice}</p>
                        <p className="text-xs text-gray-500 uppercase">{order.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.orderStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white hover:border-gray-300 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50 transition w-32"
                            value={order.orderStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <Link
                            href={`/order/${order._id}`}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> 
                    {' '}(Total: {totalOrders} orders)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => fetchOrders({ page: page - 1 })}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {/* Just simple prev/next for now to save space, but functional */}
                    <button
                      onClick={() => fetchOrders({ page: page + 1 })}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Mobile pagination */}
              <div className="flex items-center justify-between w-full sm:hidden">
                <button
                  onClick={() => fetchOrders({ page: page - 1 })}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => fetchOrders({ page: page + 1 })}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
