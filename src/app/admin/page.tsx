"use client";

import DashboardCard from "@/components/admin/DashboardCard";
import SalesChart from "@/components/admin/SalesChart";

import {
  Package,
  ShoppingCart,
  IndianRupee,
  TicketPercent,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <DashboardCard
          title="Total Products"
          value="120"
          icon={Package}
          color="bg-blue-500"
        />

        <DashboardCard
          title="Orders"
          value="340"
          icon={ShoppingCart}
          color="bg-green-500"
        />

        <DashboardCard
          title="Revenue"
          value="₹54K"
          icon={IndianRupee}
          color="bg-purple-500"
        />

        <DashboardCard
          title="Coupons"
          value="8"
          icon={TicketPercent}
          color="bg-orange-500"
        />

      </div>

      {/* Graph */}
      <SalesChart />

    </div>
  );
}