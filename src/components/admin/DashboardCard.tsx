"use client";

import { motion } from "framer-motion";

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
}: any) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition"
    >
      <div>
        <p className="text-sm text-neutral-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="text-white" size={22} />
      </div>
    </motion.div>
  );
}