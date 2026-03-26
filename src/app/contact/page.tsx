"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setStatus({ type: "success", message: "Your message has been sent successfully! We will get back to you soon." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-[var(--heading-color)] mb-4">
            Contact <span className="font-medium text-[var(--color-primary)]">Us</span>
          </h1>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto">
            Have questions about our premium Makhana? Want to place a bulk order? We're here to help. Reach out to us below.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border text-[var(--color-primary)]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--heading-color)]">Find Us</h3>
                <p className="text-[var(--color-muted)] mt-1">
                  123 Makhana Processing Unit,<br />
                  Darbhanga, Bihar 846004,<br />
                  India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border text-[var(--color-primary)]">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--heading-color)]">Call Us</h3>
                <p className="text-[var(--color-muted)] mt-1">
                  +91 98765 43210
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border text-[var(--color-primary)]">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--heading-color)]">Email Us</h3>
                <p className="text-[var(--color-muted)] mt-1">
                  support@healthebites.com
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
            
            {status && (
              <div className={`p-4 rounded-xl mb-6 flex items-center justify-between ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <span>{status.message}</span>
                <button onClick={() => setStatus(null)} className="text-xl leading-none">&times;</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[var(--color-primary)] transition"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[var(--color-primary)] transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[var(--color-primary)] transition"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[var(--color-primary)] transition resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#1a402d] transition disabled:opacity-70"
              >
                {loading ? "Sending..." : (
                  <>
                    <Send size={18} /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
