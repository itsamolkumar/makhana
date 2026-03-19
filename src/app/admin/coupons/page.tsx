"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Coupon } from "@/types";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/services/couponService";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";

export default function CouponsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "" as number | string,
    minOrder: "" as number | string,
    maxDiscount: "" as number | string,
    expiry: "",
    usageLimit: "" as number | string
  });

  const fetchCoupons = async () => {
    try {
      const response = await getCoupons({
        search: search || undefined,
        status: statusFilter || undefined
      });
      setCoupons(response.data?.data?.coupons || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [search, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discountValue || !formData.expiry) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingCoupon) {
        await updateCoupon({
          id: editingCoupon._id!,
          ...formData,
          discountValue: Number(formData.discountValue),
          minOrder: Number(formData.minOrder) || 0,
          maxDiscount: Number(formData.maxDiscount) || 0,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
          expiry: new Date(formData.expiry).toISOString()
        });
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon({
          ...formData,
          discountValue: Number(formData.discountValue),
          minOrder: Number(formData.minOrder) || 0,
          maxDiscount: Number(formData.maxDiscount) || 0,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
          expiry: new Date(formData.expiry).toISOString()
        });
        toast.success("Coupon created successfully");
      }

      setShowForm(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrder: coupon.minOrder || 0,
      maxDiscount: coupon.maxDiscount || 0,
      expiry: new Date(coupon.expiry).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrder: "",
      maxDiscount: "",
      expiry: "",
      usageLimit: ""
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const expiry = new Date(coupon.expiry);

    if (!coupon.isActive) return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    if (expiry < now) return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Expired</span>;
    if (coupon.usageLimit && coupon.usedCount! >= coupon.usageLimit) return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Limit Reached</span>;
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  if (user?.role !== 'admin') {
    return <div className="p-6">Access denied</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button
          onClick={() => {
            setEditingCoupon(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="SUMMER2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Value * ({formData.discountType === "percentage" ? "%" : "₹"})
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value === "" ? "" : Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order (₹)</label>
                <input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value === "" ? "" : Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  min="0"
                />
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value === "" ? "" : Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value === "" ? "" : Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  min="0"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
                >
                  {editingCoupon ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No coupons found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        {coupon.maxDiscount ? coupon.maxDiscount > 0 && coupon.discountType === "percentage" && (
                          <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{coupon.minOrder || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(coupon.expiry).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {coupon.usedCount || 0}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}