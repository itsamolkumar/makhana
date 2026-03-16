"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  TicketPercent,
  ShoppingCart,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Products", icon: Package, href: "/admin/products" },
  { name: "Coupons", icon: TicketPercent, href: "/admin/coupons" },
  { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-neutral-200 shadow-sm p-5"
    >
      <h2 className="text-xl font-semibold mb-8 text-[var(--color-primary)]">
        Admin Panel
      </h2>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition"
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </nav>
    </motion.aside>
  );
}