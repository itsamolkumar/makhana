"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

export default function EditProductPage() {

  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`);
      const data = await res.json();

      setProduct(data.data?.product);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleUpdate = async (payload: any) => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update product");
      }
    } catch (error: any) {
      toast.error("Failed to update product: " + (error.message || "Unknown error"));
    }
  };

  if (loading) return <Loader />;

  if (!product) return <Loader />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Update product information
          </p>
        </div>

        <Link
          href="/admin/products"
          className="px-4 py-2 rounded-xl border"
        >
          Back
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow p-6">

        <ProductForm
          initialValues={{
            name: product.name || "",
            price: product.price?.toString() || "",
            discountPrice: product.discountPrice?.toString() || "",
            category: product.category || "",
            weight: product.weight || "",
            stock: product.stock?.toString() || "",
            description: product.description || "",
            images: product.images || []
          }}
          onSubmit={handleUpdate}
          submitLabel="Update Product"
        />

      </div>

    </div>
  );
}