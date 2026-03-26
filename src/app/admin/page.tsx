"use client";

import DashboardCard from "@/components/admin/DashboardCard";
import SalesChart from "@/components/admin/SalesChart";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { Users, Truck, LogOut } from "lucide-react";

import {
  Package,
  ShoppingCart,
  IndianRupee,
  TicketPercent,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
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
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[var(--heading-color)]">Dashboard Overview</h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <Link href="/admin/products" className="block">
          <DashboardCard
            title="Total Products"
            value={stats.counts?.products || 0}
            icon={Package}
            color="bg-blue-500"
          />
        </Link>

        <Link href="/admin/orders" className="block">
          <DashboardCard
            title="Total Orders"
            value={stats.counts?.orders || 0}
            icon={ShoppingCart}
            color="bg-green-500"
          />
        </Link>

        <div className="block cursor-default">
          <DashboardCard
            title="Total Revenue"
            value={`₹${stats.revenue?.toLocaleString('en-IN') || 0}`}
            icon={IndianRupee}
            color="bg-purple-500"
          />
        </div>

        <Link href="/admin/coupons" className="block">
          <DashboardCard
            title="Total Coupons"
            value={stats.counts?.coupons || 0}
            icon={TicketPercent}
            color="bg-orange-500"
          />
        </Link>

        <Link href="/admin/users" className="block">
          <DashboardCard
            title="Total Users"
            value={stats.counts?.users || 0}
            icon={Users}
            color="bg-indigo-500"
          />
        </Link>

      </div>

      {/* Graph */}
      <SalesChart data={stats.salesData || []} />

    </div>
  );
}