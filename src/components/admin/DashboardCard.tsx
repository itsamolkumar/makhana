"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconWrapClassName: string;
  iconClassName: string;
  subtitle?: string;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  iconWrapClassName,
  iconClassName,
  subtitle,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-[24px] border border-[#e8edf5] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(17,24,39,0.1)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8496]">{title}</p>
          <h3 className="mt-3 text-2xl font-semibold leading-none text-[#121826] sm:text-[30px]">{value}</h3>
          {subtitle ? <p className="mt-2 text-sm leading-5 text-[#667085]">{subtitle}</p> : null}
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconWrapClassName}`}>
          <Icon className={iconClassName} size={20} strokeWidth={2.2} />
        </div>
      </div>
    </motion.div>
  );
}
