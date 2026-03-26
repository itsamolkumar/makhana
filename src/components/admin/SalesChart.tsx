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

interface SalesChartProps {
  data: { name: string; sales: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <h2 className="font-semibold text-lg text-[var(--heading-color)] mb-6">Revenue Overview</h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} tickFormatter={(value) => `₹${value}`} dx={-10} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
              formatter={(value: any) => [`₹${value}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}