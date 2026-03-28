"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <Providers>
      {!isAdminRoute && <Navbar />}
      <div className={isAdminRoute ? "min-h-screen" : "min-h-screen pt-[70px]"}>{children}</div>
      {!isAdminRoute && <Footer />}
    </Providers>
  );
}