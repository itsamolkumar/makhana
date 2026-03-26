"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { updateUser } from "@/redux/slices/authSlice";
import { User, Mail, Phone, Save, Loader2 } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      dispatch(updateUser({
        name: data.data?.user?.name || formData.name,
        email: data.data?.user?.email || formData.email,
        mobile: data.data?.user?.mobile || formData.mobile,
      }));

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-10 flex justify-center text-gray-500">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-hidden focus:border-[var(--color-primary)] transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-hidden focus:border-[var(--color-primary)] transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-hidden focus:border-[var(--color-primary)] transition"
                placeholder="Enter your mobile number"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a402d] transition disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
