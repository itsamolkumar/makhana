"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { IndianRupee, TrendingUp, CalendarRange } from "lucide-react";

interface SalesChartProps {
  data: { name: string; sales: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const totalRevenue = data.reduce((sum, item) => sum + item.sales, 0);
  const averageRevenue = data.length ? totalRevenue / data.length : 0;
  const bestDay = data.reduce<{ name: string; sales: number } | null>(
    (best, item) => (!best || item.sales > best.sales ? item : best),
    null
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e8edf5] bg-white shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
      <div className="border-b border-[#edf2f7] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8496]">Revenue</p>
            <h2 className="mt-2 text-xl font-semibold text-[#121826] sm:text-2xl">Revenue trend</h2>
            <p className="mt-1 text-sm text-[#667085]">Recent sales performance at a glance.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 ring-1 ring-[#edf2f7]">
              <div className="flex items-center gap-2 text-[#3156a6]">
                <IndianRupee size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8496]">Total</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-[#121826]">Rs {totalRevenue.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 ring-1 ring-[#edf2f7]">
              <div className="flex items-center gap-2 text-[#059669]">
                <TrendingUp size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8496]">Average</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-[#121826]">Rs {Math.round(averageRevenue).toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 ring-1 ring-[#edf2f7]">
              <div className="flex items-center gap-2 text-[#d97706]">
                <CalendarRange size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8496]">Best period</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-[#121826]">{bestDay ? bestDay.name : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="h-72 w-full sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F7CFF" stopOpacity={0.3} />
                  <stop offset="55%" stopColor="#22C55E" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7b8496", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7b8496", fontSize: 12 }}
                tickFormatter={(value) => `Rs ${value}`}
                dx={-4}
                width={76}
              />
              <Tooltip
                cursor={{ stroke: "#4F7CFF", strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid #e5ebf4",
                  boxShadow: "0 16px 32px rgba(17,24,39,0.12)",
                  backgroundColor: "#ffffff",
                }}
                labelStyle={{ color: "#121826", fontWeight: 600 }}
                itemStyle={{ color: "#3156A6", fontWeight: 600 }}
                formatter={(value) => [`Rs ${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area
                type="monotoneX"
                dataKey="sales"
                stroke="#3156A6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff", fill: "#F59E0B" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
