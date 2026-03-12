"use client";

import { useState, useEffect } from "react";
import { getProducts, ProductsParams } from "@/services/productService";
import { Product } from "@/types";
import ProductCard from "@/components/shop/ProductCard";
import { Search, Filter, SlidersHorizontal, PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["all", "Makhana", "Dry Fruits", "Seeds", "Combos"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: ProductsParams = {
        page,
        limit: 12,
        sort
      };
      
      if (search) params.search = search;
      if (category !== "all") params.category = category;

      const res = await getProducts(params);
      
      if (res.data?.data) {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset page on new filters
      fetchProducts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [page]); // Fetch when page changes

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Page Header Banner */}
      <div className="bg-[var(--color-primary)] text-white py-16 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Premium Selection</h1>
          <p className="text-white/80 max-w-xl text-lg">
            Discover our range of healthy, roasted Makhana and premium dry fruits carefully curated for your wellness journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between mb-2">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 font-medium text-gray-700"
          >
            <Filter size={20} />
            Filters & Categories
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-3 py-2">
             <span className="font-bold text-[var(--color-primary)]">{products.length}</span> items
          </div>
        </div>

        {/* Sidebar / Filters */}
        <AnimatePresence>
          {(showMobileFilters || typeof window !== 'undefined' && window.innerWidth >= 768) && (
            <motion.aside 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full md:w-64 flex-shrink-0 flex flex-col gap-8 md:!h-auto md:!opacity-100 overflow-hidden md:overflow-visible"
            >
              {/* Search */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Search size={18} className="text-[var(--color-primary)]" />
                  Search
                </h3>
                <input 
                  type="text" 
                  placeholder="Find your snack..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50 focus:bg-white transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 inline-flex items-center gap-2">
                  <PackageOpen size={18} className="text-[var(--color-primary)]" />
                  Categories
                </h3>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        if (window.innerWidth < 768) setShowMobileFilters(false);
                      }}
                      className={`text-left px-4 py-2.5 rounded-xl capitalize font-medium transition-all ${
                        category === cat 
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          {/* Top Bar (Sorting & Desktop Count) */}
          <div className="hidden md:flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{products.length}</span> products
            </p>
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={18} className="text-gray-400" />
              <select 
                className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium appearance-none cursor-pointer"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white aspect-[3/4] rounded-3xl animate-pulse shadow-sm border border-gray-100 p-6 flex flex-col">
                  <div className="w-full flex-grow bg-gray-100 rounded-2xl mb-4"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded-lg mt-auto"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map(product => (
                <ProductCard key={product.id || product.slug} product={product} />
              ))}
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} className="text-gray-400" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
               <p className="text-gray-500 max-w-sm">We couldn't find any products matching your current filters. Try adjusting your search or category.</p>
               <button 
                 onClick={() => { setSearch(""); setCategory("all"); }}
                 className="mt-6 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-6 py-3 rounded-xl font-bold hover:bg-[var(--color-primary)]/20 transition"
               >
                 Clear Filters
               </button>
             </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold transition flex items-center justify-center ${
                    page === i + 1 
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" 
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
