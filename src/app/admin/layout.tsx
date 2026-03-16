"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

export default function AdminLayout({ children }: any) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        toast.error("You are not logged in");
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
        return;
      }
      if (user?.role !== "admin") {
        toast.error("You are not an admin");
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
        return;
      }
    }
  }, [isAuthenticated, isInitialized, user, router, currentPath]);

  if (!isInitialized) {
    return <Loader />;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // or a loading spinner
  }

  return (
    <div className="flex bg-neutral-50 min-h-screen">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            className="fixed top-0 left-0 w-64 h-screen bg-white z-50 shadow-lg md:hidden"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <Topbar setOpen={setOpen} />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}