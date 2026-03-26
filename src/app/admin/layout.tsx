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
      <Sidebar className="hidden md:flex w-64 z-10" />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ ease: "circOut", duration: 0.3 }}
              className="fixed top-0 left-0 w-64 h-screen bg-white z-50 shadow-2xl md:hidden overflow-y-auto"
            >
              <button 
                onClick={() => setOpen(false)}
                className="absolute top-6 right-4 p-1.5 bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <Sidebar className="w-full border-none shadow-none pt-4" />
            </motion.div>
          </>
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