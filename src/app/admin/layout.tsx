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
    setOpen(false);
  }, [pathname]);

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
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30 w-64 border-r border-neutral-200 bg-white shadow-sm">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ ease: "circOut", duration: 0.25 }}
              className="fixed top-0 left-0 z-[70] h-screen w-[min(100vw-3rem,18rem)] bg-white shadow-2xl md:hidden overflow-y-auto border-r border-neutral-100"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-3 p-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <Sidebar className="w-full border-0 shadow-none pt-14 pb-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main column: topbar fixed, content scrolls */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <Topbar setOpen={setOpen} />
        <main className="flex-1 px-4 pb-6 pt-16 md:px-6 md:pb-8">{children}</main>
      </div>
    </div>
  );
}