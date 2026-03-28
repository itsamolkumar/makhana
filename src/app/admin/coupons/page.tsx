"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Coupon } from "@/types";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/services/couponService";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Search } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">Coupons</h1>
        <button
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={18} />
          Add coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm sm:w-auto sm:min-w-[160px]"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
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

      {/* Coupons list */}
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            <p className="mt-2 text-sm text-neutral-600">Loading coupons…</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No coupons found</div>
        ) : (
          <>
            <div className="divide-y divide-neutral-100 md:hidden">
              {coupons.map((coupon) => (
                <div key={coupon._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-lg font-bold text-neutral-900">{coupon.code}</span>
                    {getStatusBadge(coupon)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-neutral-500">Discount</p>
                      <p className="font-medium">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Min order</p>
                      <p className="font-medium">₹{coupon.minOrder || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Expires</p>
                      <p className="font-medium">{new Date(coupon.expiry).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Used</p>
                      <p className="font-medium">
                        {coupon.usedCount || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(coupon)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2 text-sm font-medium text-blue-700"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon._id!)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2 text-sm font-medium text-red-700"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Min order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Usage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-neutral-50/80">
                      <td className="px-4 py-3 font-mono font-semibold text-neutral-900">{coupon.code}</td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        {coupon.maxDiscount && coupon.maxDiscount > 0 && coupon.discountType === "percentage" && (
                          <div className="text-xs text-neutral-500">Max ₹{coupon.maxDiscount}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">₹{coupon.minOrder || 0}</td>
                      <td className="px-4 py-3 text-sm">{new Date(coupon.expiry).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.usedCount || 0}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(coupon)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEdit(coupon)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
                            <Edit size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(coupon._id!)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}