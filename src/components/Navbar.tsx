"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isAuthenticated, isInitialized, user } = useAppSelector(
    (state) => state.auth
  );

  const currentPath = `${pathname}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const loginUrl = `/login?redirectTo=${encodeURIComponent(currentPath)}`;

  const { items } = useAppSelector((state) => state.cart);
  const cartItemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Close dropdown outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock scroll on mobile menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API failed", error);
    }
    dispatch(logoutUser());
    setProfileOpen(false);
    setOpen(false);
    router.push("/login");
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b shadow-sm">

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-[70px] flex items-center justify-between">

        {/* LOGO */}
        <Link href="/">
          <Image
            src="/LogoText.png"
            alt="Logo"
            width={140}
            height={40}
            className="h-9 md:h-11 w-auto"
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          {isAuthenticated && user?.role === "admin" && (
            <Link href="/admin" className="font-semibold text-[var(--color-primary)]">Dashboard</Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* CART */}
          <Link href="/cart">
            <button className="relative p-2 rounded-full hover:bg-neutral-100 transition">
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </Link>

          {/* ===== DESKTOP AUTH ===== */}
          <div className="hidden md:flex items-center gap-3" ref={dropdownRef}>
            {!isInitialized ? (
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border"
                >
                  {user?.profile_image ? (
                    <Image
                      src={user.profile_image}
                      alt="profile"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border"
                    >
                      <div className="p-3 border-b">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 p-3 hover:bg-gray-50 text-[var(--color-primary)]"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                      )}

                      <Link
                        href="/profile/orders"
                        className="flex items-center gap-2 p-3 hover:bg-gray-50"
                      >
                        <Package size={16} /> My Orders
                      </Link>

                      <Link
                        href="/profile/settings"
                        className="flex items-center gap-2 p-3 hover:bg-gray-50"
                      >
                        <Settings size={16} /> Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left p-3 text-red-500 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href={loginUrl} className="flex items-center gap-1">
                  <User size={16} /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-1">
                  <User size={16} /> Sign Up
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BTN */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="md:hidden absolute top-[70px] left-0 w-full bg-white shadow-xl"
          >
            <div className="flex flex-col p-6 gap-6">

              <Link href="/shop" onClick={() => setOpen(false)}>Shop</Link>
              <Link href="/about" onClick={() => setOpen(false)}>About</Link>
              <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>

              <hr />

              {!isInitialized ? (
                <div className="h-10 bg-gray-100 animate-pulse rounded" />
              ) : isAuthenticated ? (
                <>
                  {/* PROFILE BLOCK */}
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border">
                      {user?.profile_image ? (
                        <Image
                          src={user.profile_image}
                          alt="profile"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-[var(--color-primary)]"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile/orders"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <Package size={18} /> My Orders
                  </Link>

                  <Link
                    href="/profile/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <Settings size={18} /> Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={loginUrl}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <User size={18} /> Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <User size={18} /> Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}