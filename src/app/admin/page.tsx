"use client";

import DashboardCard from "@/components/admin/DashboardCard";
import SalesChart from "@/components/admin/SalesChart";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import {
  Users,
  Sparkles,
  Package,
  ShoppingCart,
  IndianRupee,
  TicketPercent,
  ArrowUpRight,
} from "lucide-react";

interface AdminStats {
  revenue?: number;
  salesData?: { name: string; sales: number }[];
  counts?: {
    products?: number;
    orders?: number;
    coupons?: number;
    users?: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const currency = `Rs ${stats.revenue?.toLocaleString("en-IN") || 0}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="overflow-hidden rounded-[30px] border border-[#e8edf5] bg-[linear-gradient(135deg,#ffffff_0%,#f6f9ff_52%,#f8fdfb_100%)] p-4 shadow-[0_14px_38px_rgba(17,24,39,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3156A6]">
              <Sparkles size={14} />
              Overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#121826] sm:text-4xl">
              Today at a glance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085] sm:text-[15px]">
              Revenue, orders and customer activity in one clean admin dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[420px]">
            <div className="rounded-2xl border border-[#e7ebf4] bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8496]">Revenue</p>
              <p className="mt-2 text-base font-semibold text-[#121826] sm:text-lg">{currency}</p>
            </div>
            <div className="rounded-2xl border border-[#e7ebf4] bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8496]">Orders</p>
              <p className="mt-2 text-base font-semibold text-[#121826] sm:text-lg">{stats.counts?.orders || 0}</p>
            </div>
            <div className="rounded-2xl border border-[#e7ebf4] bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8496]">Customers</p>
              <p className="mt-2 text-base font-semibold text-[#121826] sm:text-lg">{stats.counts?.users || 0}</p>
            </div>
            <div className="rounded-2xl border border-[#dcf5ee] bg-[#effcf7] px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#059669]">
                <ArrowUpRight size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Status</span>
              </div>
              <p className="mt-2 text-base font-semibold text-[#121826] sm:text-lg">Live</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/admin/products" className="block h-full">
          <DashboardCard
            title="Products"
            value={stats.counts?.products || 0}
            icon={Package}
            iconWrapClassName="bg-[#eef4ff]"
            iconClassName="text-[#3156A6]"
            subtitle="Live items in your catalog."
          />
        </Link>

        <Link href="/admin/orders" className="block h-full">
          <DashboardCard
            title="Orders"
            value={stats.counts?.orders || 0}
            icon={ShoppingCart}
            iconWrapClassName="bg-[#effcf7]"
            iconClassName="text-[#059669]"
            subtitle="Orders received from customers."
          />
        </Link>

        <div className="block h-full cursor-default">
          <DashboardCard
            title="Revenue"
            value={currency}
            icon={IndianRupee}
            iconWrapClassName="bg-[#fff4e8]"
            iconClassName="text-[#d97706]"
            subtitle="Total recorded revenue."
          />
        </div>

        <Link href="/admin/coupons" className="block h-full">
          <DashboardCard
            title="Coupons"
            value={stats.counts?.coupons || 0}
            icon={TicketPercent}
            iconWrapClassName="bg-[#f4efff]"
            iconClassName="text-[#7c3aed]"
            subtitle="Promotions currently configured."
          />
        </Link>

        <Link href="/admin/users" className="block h-full">
          <DashboardCard
            title="Users"
            value={stats.counts?.users || 0}
            icon={Users}
            iconWrapClassName="bg-[#fff0f3]"
            iconClassName="text-[#db2777]"
            subtitle="Registered customers on the store."
          />
        </Link>

        <div className="rounded-[24px] border border-[#e8edf5] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
            <Sparkles size={14} />
            Notes
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#121826]">Admin summary</p>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Review the key store numbers above, then use the cards to jump into the right admin section.
          </p>
        </div>
      </div>

      <SalesChart data={stats.salesData || []} />
    </div>
  );
}
