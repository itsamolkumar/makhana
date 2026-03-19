"use client";

import { useEffect, useState } from "react";

export default function ProductDebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try both endpoints
        const [res1, res2] = await Promise.all([
          fetch("/api/products/traditional-raw-makhana-2"),
          fetch("/api/test-product")
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        setData({
          bySlug: data1,
          testEndpoint: data2
        });

        console.log("By Slug:", data1);
        console.log("Test Endpoint:", data2);
      } catch (err) {
        console.error("Error:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-xl">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 text-xl">Error: {error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🔍 Product Debug - traditional-raw-makhana-2</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">By Slug Endpoint</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(data?.bySlug, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Test Endpoint</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(data?.testEndpoint, null, 2)}
          </pre>
        </div>

        {data?.bySlug?.data?.product && (
          <div className="bg-green-50 p-6 rounded-lg shadow border-2 border-green-200">
            <h2 className="text-2xl font-bold mb-4 text-green-800">✅ Product Found!</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {data.bySlug.data.product.name}</p>
              <p><strong>Images:</strong> {data.bySlug.data.product.images?.length || 0}</p>
              <p><strong>In Stock:</strong> {data.bySlug.data.product.inStock ? "Yes ✅" : "No ❌"}</p>
              {data.bySlug.data.product.images?.[0] && (
                <>
                  <p><strong>First Image URL:</strong></p>
                  <p className="text-blue-500 break-all">{data.bySlug.data.product.images[0]}</p>
                  <img 
                    src={data.bySlug.data.product.images[0]} 
                    alt="Product" 
                    className="mt-4 max-w-xs rounded border"
                    onError={(e) => {
                      console.log("Image failed to load");
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
