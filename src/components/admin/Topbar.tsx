"use client";

import { Menu, User, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function titleFromPath(pathname: string) {
  if (pathname === "/admin" || pathname === "/admin/") return "Dashboard";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/products/new")) return "New product";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/coupons")) return "Coupons";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/customize")) return "Customize site";
  return "Admin";
}

export default function Topbar({ setOpen }: { setOpen: (v: boolean | ((p: boolean) => boolean)) => void }) {
  const pathname = usePathname();
  const title = titleFromPath(pathname || "");

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white/95 px-3 backdrop-blur-md md:left-64 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="truncate text-base font-semibold text-neutral-900 sm:text-lg">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-emerald-50 sm:gap-2 sm:px-3"
          title="Back to store"
        >
          <Home size={18} className="shrink-0" />
          <span className="hidden sm:inline">Store</span>
        </Link>
        <Link
          href="/profile/settings"
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
          title="Profile settings"
        >
          <User size={20} />
        </Link>
      </div>
    </header>
  );
}
