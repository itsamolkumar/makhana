"use client";

import { Menu, Bell, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Topbar({ setOpen }: any) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40"
    >
      <button
        onClick={() => setOpen((p: any) => !p)}
        className="md:hidden"
      >
        <Menu size={22} />
      </button>

      <h1 className="font-semibold text-lg">Dashboard</h1>

      <div className="flex items-center gap-4">
        <Bell size={20} />
        <User size={22} className="bg-neutral-100 p-1 rounded-full" />
      </div>
    </motion.header>
  );
}