import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import ClientLayout from "./ClientLayout";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmSans",
});

export const metadata: Metadata = {
  title: "Healthe Bites | Premium Makhana",
  description: "Premium makhana sourced directly from Bihar.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}