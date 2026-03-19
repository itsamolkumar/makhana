"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import Footer from "@/components/Footer";
import Providers from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmSans",
});

// export const metadata: Metadata = {
//   title: "Healthe Bites | Premium Makhana",
//   description: "Premium makhana sourced directly from Bihar.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);


  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>

        <AnimatePresence>
          {loading && <Loader />}
        </AnimatePresence>

        {!loading && (
          <><Providers>
            <Navbar />
            {children}
            <Footer/>
          </Providers>

          </>
        )}

      </body>
    </html>
  );
}