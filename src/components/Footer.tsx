"use client";

import { useEffect, useState } from "react";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/customization", { cache: "no-store" });
        const { data } = await res.json();
        if (data && data.socialLinks) {
          setSocialLinks(data.socialLinks);
        }
      } catch (err) {
        console.error("Failed to fetch custom social links");
      }
    }
    fetchConfig();
  }, []);

  return (
    <footer className="bg-[var(--color-bg)] border-t border-neutral-200 py-16 px-6">

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">

        {/* Brand */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="text-center md:text-left"
>
  <img
    src="/hBLOGO.svg"
    alt="HealtheBites Logo"
    className="h-20 md:h-24 w-auto mx-auto md:mx-0 mb-8 object-contain"
  />

  <p className="text-[var(--color-muted)] leading-relaxed text-sm max-w-sm mx-auto md:mx-0">
    Premium makhana sourced from Bihar, crafted for mindful and modern snacking.
  </p>
</motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h4 className="text-lg font-medium text-[var(--heading-color)] mb-4">
            Quick Links
          </h4>
          <ul className="space-y-3 text-[var(--color-muted)] text-sm flex flex-col">
            <Link href="/shop" className="hover:text-[var(--color-primary)] transition">Shop</Link>
            <Link href="/about" className="hover:text-[var(--color-primary)] transition">About</Link>
            <Link href="/contact" className="hover:text-[var(--color-primary)] transition">Contact</Link>
          </ul>
        </motion.div>

        {/* Social */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h4 className="text-lg font-medium text-[var(--heading-color)] mb-4">
            Connect With Us
          </h4>

          <div className="flex gap-5">
            {socialLinks.instagram ? (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer">
                <Instagram className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition cursor-pointer" />
              </a>
            ) : (
              <Instagram className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition cursor-pointer" />
            )}

            {socialLinks.facebook ? (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer">
                <Facebook className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition cursor-pointer" />
              </a>
            ) : (
              <Facebook className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition cursor-pointer" />
            )}

            {socialLinks.twitter ? (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer">
                <Twitter className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition cursor-pointer" />
              </a>
            ) : (
              <Twitter className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition cursor-pointer" />
            )}
          </div>
        </motion.div>

      </div>

      {/* Bottom Line */}
      <div className="mt-16 text-center text-sm text-[var(--color-muted)]">
        © {new Date().getFullYear()} HealtheBites. All rights reserved.
      </div>

    </footer>
  );
}