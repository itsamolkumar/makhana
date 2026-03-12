"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LogOut, Settings, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Redux state
  const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setProfileOpen(false);
    router.push("/login");
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-neutral-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-[70px] flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/LogoText.png"
            alt="HealtheBites Logo"
            className="h-9 md:h-11 w-auto object-contain"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <Link href="/shop" className="relative group hover:text-[var(--color-primary)] transition">
            Shop
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-primary)] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/about" className="relative group hover:text-[var(--color-primary)] transition">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-primary)] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/contact" className="relative group hover:text-[var(--color-primary)] transition">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-primary)] transition-all group-hover:w-full"></span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4 relative">
          
          {/* Cart */}
          <Link href="/cart">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-full hover:bg-neutral-100 transition flex items-center justify-center cursor-pointer"
            >
              <ShoppingCart size={22} className="text-gray-700" />
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    key={cartItemCount}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: [1, 1.4, 1], y: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </Link>

          {/* Profile Dropdown / Auth Links */}
          <div className="hidden md:flex items-center gap-2" ref={dropdownRef}>
            {!isInitialized ? (
               <div className="w-20 h-8 animate-pulse bg-gray-100 rounded-full" />
            ) : isAuthenticated ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-sm transition-all focus:outline-none"
                    title={user?.name || "Profile"}
                  >
                    <User size={20} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/profile/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] transition">
                            <Package size={16} /> My Orders
                          </Link>
                          <Link href="/profile/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] transition">
                            <Settings size={16} /> Settings
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Visible Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="p-2 ml-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/login" className="text-sm font-medium hover:text-[var(--color-primary)] transition">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-medium bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-[#244a40] transition shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-gray-700"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
           <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-[70px] left-0 w-full bg-white/95 backdrop-blur-2xl shadow-2xl border-b border-gray-100 rounded-b-3xl overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 gap-8">
              
              {/* Main Navigation Links */}
              <div className="flex flex-col gap-2">
                <Link href="/shop" onClick={() => setOpen(false)} className="flex items-center justify-between p-4 rounded-2xl text-gray-800 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition font-medium border border-transparent hover:border-[var(--color-primary)]/10">
                  <span className="text-lg">Shop</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link href="/about" onClick={() => setOpen(false)} className="flex items-center justify-between p-4 rounded-2xl text-gray-800 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition font-medium border border-transparent hover:border-[var(--color-primary)]/10">
                  <span className="text-lg">About</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
                <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center justify-between p-4 rounded-2xl text-gray-800 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition font-medium border border-transparent hover:border-[var(--color-primary)]/10">
                  <span className="text-lg">Contact</span>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {!isInitialized ? (
                 <div className="h-20 animate-pulse bg-gray-100 rounded-2xl" />
              ) : isAuthenticated ? (
                <div className="flex flex-col gap-6">
                  {/* Profile Card */}
                  <div className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="bg-white shadow-md p-3.5 rounded-full text-[var(--color-primary)] z-10">
                      <User size={26} strokeWidth={2.5} />
                    </div>
                    <div className="z-10 flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-sm text-gray-500 font-medium truncate">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Account Action Links */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/profile/orders" onClick={() => setOpen(false)} className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[var(--color-primary)]/5 text-gray-700 hover:text-[var(--color-primary)] p-4 rounded-2xl border border-gray-100 transition">
                      <Package size={24} className="mb-1" /> 
                      <span className="text-sm font-semibold">My Orders</span>
                    </Link>
                    <Link href="/profile/settings" onClick={() => setOpen(false)} className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[var(--color-primary)]/5 text-gray-700 hover:text-[var(--color-primary)] p-4 rounded-2xl border border-gray-100 transition">
                      <Settings size={24} className="mb-1" /> 
                      <span className="text-sm font-semibold">Settings</span>
                    </Link>
                  </div>

                  {/* Mobile Logout Button */}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center justify-center gap-2 mt-2 bg-red-50/80 text-red-600 hover:bg-red-500 hover:text-white transition-all w-full py-4 rounded-2xl font-bold shadow-sm border border-red-100 hover:border-red-500"
                  >
                    <LogOut size={20} strokeWidth={2.5} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-2xl text-center font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition drop-shadow-sm"
                  >
                    Login to Account
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="w-full bg-[var(--color-primary)] text-white py-4 rounded-2xl text-center font-bold text-lg shadow-xl shadow-[var(--color-primary)]/20 hover:bg-[#244a40] transition"
                  >
                    Create New Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}