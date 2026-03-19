"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=100");
        const data = await res.json();
        console.log("API Response:", data);
        setProducts(data.data?.products || []);
      } catch (err) {
        console.error("Error:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Database Debug</h1>
      <p className="text-lg mb-4">
        Total Products: <strong>{products.length}</strong>
      </p>

      <div className="space-y-4">
        {products.map((product, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="font-bold text-xl">{product.name}</h2>
            <p className="text-sm text-gray-600">Slug: {product.slug}</p>
            <p className="text-sm text-gray-600">
              Images: {product.images?.length || 0} 
              {product.images && product.images.length > 0 && (
                <>
                  <br />
                  First: {product.images[0].substring(0, 80)}...
                </>
              )}
            </p>
            <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
            <p className="text-sm text-gray-600">Category: {product.category}</p>
            <p className="text-sm text-gray-600">In Stock: {product.inStock ? "✅ Yes" : "❌ No"}</p>
            
            {product.images && product.images.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {product.images.map((img: string, i: number) => (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm"
                  >
                    Image {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
