"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();

  const handleSubmit = async (payload: any) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Product created successfully!");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create product");
      }
    } catch (error: any) {
      toast.error("Failed to create product: " + (error.message || "Unknown error"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">

        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-neutral-100 transition"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="text-xl font-semibold">
          Add New Product
        </h1>

      </div>

      {/* Form */}
      <ProductForm onSubmit={handleSubmit} />

    </motion.div>
  );
}