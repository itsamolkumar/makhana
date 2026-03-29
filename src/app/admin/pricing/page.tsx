"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ReceiptIndianRupee, Truck, Percent } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPricingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    gstRatePercent: 18,
    serviceCharge: 12,
    deliveryCharge: 39,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/store-settings");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load pricing settings");
        return;
      }

      const settings = data.data?.settings;
      setForm({
        gstRatePercent: Number(((settings?.gstRate || 0) * 100).toFixed(2)),
        serviceCharge: settings?.serviceCharge ?? 0,
        deliveryCharge: settings?.deliveryCharge ?? 0,
      });
    } catch {
      toast.error("Failed to load pricing settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save pricing settings");
        return;
      }

      const settings = data.data?.settings;
      setForm({
        gstRatePercent: Number(((settings?.gstRate || 0) * 100).toFixed(2)),
        serviceCharge: settings?.serviceCharge ?? 0,
        deliveryCharge: settings?.deliveryCharge ?? 0,
      });
      toast.success("Pricing settings updated");
    } catch {
      toast.error("Failed to save pricing settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const previewTotal =
    299 -
    30 +
    Number(form.serviceCharge || 0) +
    Number(form.deliveryCharge || 0) +
    ((299 - 30) * Number(form.gstRatePercent || 0)) / 100;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing & Charges</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ye values checkout aur payment summary me sabhi orders par default
            apply hongi.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ReceiptIndianRupee className="h-4 w-4" />
          )}
          Save Charges
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Default order charges
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Percent className="h-4 w-4 text-[var(--color-primary)]" />
                GST (%)
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.gstRatePercent}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    gstRatePercent: Number(e.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ReceiptIndianRupee className="h-4 w-4 text-[var(--color-primary)]" />
                Service Charge (Rs)
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.serviceCharge}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceCharge: Number(e.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Truck className="h-4 w-4 text-[var(--color-primary)]" />
                Delivery Charge (Rs)
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.deliveryCharge}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    deliveryCharge: Number(e.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#fbf6ec] via-white to-[#eef6f0] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--heading-color)]">
            Preview
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Sample cart: Rs 299 subtotal, Rs 30 discount
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rs 299.00</span>
            </div>
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>-Rs 30.00</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST ({form.gstRatePercent}%)</span>
              <span>
                Rs {(((299 - 30) * form.gstRatePercent) / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service charge</span>
              <span>Rs {Number(form.serviceCharge || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery charge</span>
              <span>Rs {Number(form.deliveryCharge || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
              <span>Total payable</span>
              <span>Rs {previewTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
