"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import FadeUp from "@/components/FadeUp";
import { Product } from "@/types";
import { getProducts } from "@/services/productService";
import ProductCard from "@/components/shop/ProductCard";

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts({ limit: 3 });
        if (res.data?.data) {
          setProducts(res.data.data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20 px-6 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-light text-[var(--heading-color)] mb-4">
                Choose Your Pack
              </h2>
              <p className="text-[var(--color-muted)]">
                Light. Crunchy. Purely Premium.
              </p>
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-md animate-pulse h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 px-6 bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto">

        <FadeUp>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-14 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-light text-[var(--heading-color)] mb-4">
                Choose Your Pack
              </h2>
              <p className="text-[var(--color-muted)]">
                Light. Crunchy. Purely Premium.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3 rounded-full hover:opacity-90 transition"
              >
                <ShoppingBag size={18} />
                View All Products
              </Link>
            </div>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {products.map((product, index) => (
            <FadeUp key={product._id || product.slug} delay={index * 0.1}>
              <ProductCard product={product} />
            </FadeUp>
          ))}
        </div>

      </div>
    </section>
  );
}