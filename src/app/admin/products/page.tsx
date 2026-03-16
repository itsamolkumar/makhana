"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { PRODUCT_CATEGORIES } from "@/constants/productCategories";
import Loader from "@/components/Loader";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("active");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");

  const fetchProducts = async (opts: { search?: string } = {}) => {
    setLoading(true);

    const params = new URLSearchParams();
    const appliedSearch = opts.search ?? searchTerm;
    const appliedStatus = statusFilter;

    if (appliedSearch) params.set("search", appliedSearch);
    if (categoryFilter) params.set("category", categoryFilter);
    if (appliedStatus) params.set("status", appliedStatus);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minStock) params.set("minStock", minStock);
    if (maxStock) params.set("maxStock", maxStock);

    const url = `/api/admin/products${params.toString() ? `?${params.toString()}` : ""}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Failed to load products");
        setProducts([]);
      } else {
        const data = await res.json();
        setProducts(data.data?.products || []);
      }
    } catch (error: any) {
      toast.error("Failed to load products: " + (error.message || "Unknown error"));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    fetchProducts({ search: searchTerm });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Product deleted successfully!");
        fetchProducts(); // Refresh the list
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete product");
      }
    } catch (error: any) {
      toast.error("Failed to delete product: " + (error.message || "Unknown error"));
    }
  };

  const handleApplyFilters = () => {
    fetchProducts({ search: searchTerm });
  };

  const handleResetFilters = () => {
    setCategoryFilter("");
    setStatusFilter("active");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setMaxStock("");
    setSearchTerm("");

    fetchProducts({ search: "" });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Products</h1>

        <Link
          href="/admin/products/new"
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18}/>
          Add Product
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[220px]">
          <input
            placeholder="Search product..."
            className="w-full border rounded-xl px-4 py-2"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        <button
          type="button"
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl"
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          type="button"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl"
          onClick={() => setIsFilterOpen(true)}
        >
          Filters
        </button>
      </div>

      {/* Filter modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsFilterOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  <option value="">All</option>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "" | "active" | "inactive")}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Any"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Min Stock</label>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Max Stock</label>
                <input
                  type="number"
                  value={maxStock}
                  onChange={(e) => setMaxStock(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl"
                onClick={handleResetFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl"
                onClick={() => {
                  handleApplyFilters();
                  setIsFilterOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg)]">
            <tr className="text-left">
              <th className="p-4">Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p:any)=>(
              <tr key={p._id} className="border-t hover:bg-gray-50">

                <td className="p-4">
                  <img src={p.images[0]} className="h-12 w-12 rounded-lg object-cover"/>
                </td>

                <td className="font-medium">{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>

                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    p.isActive ? "bg-green-100 text-green-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="p-4 text-right flex gap-2 justify-end">
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="p-2 bg-[var(--color-bg)] rounded-lg"
                  >
                    <Edit2 size={16}/>
                  </Link>

                  <button 
                    className="p-2 bg-red-50 rounded-lg"
                    onClick={() => handleDelete(p._id)}
                  >
                    <Trash2 size={16} className="text-red-500"/>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No products found.
        </div>
      )}

    </div>
  );
}