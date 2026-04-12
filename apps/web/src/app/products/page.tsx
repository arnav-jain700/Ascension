"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductFilters } from "@/components/product-filters";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { apiClient, Product, ProductsResponse } from "@/lib/api";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || "",
    gender: searchParams.get("gender") || "all",
    priceRange: searchParams.get("priceRange") || "all",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    sort: searchParams.get("sort") || "newest",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts({
          ...filters,
          sort: filters.sort as "newest" | "oldest" | "price-asc" | "price-desc",
          page: currentPage,
          limit: 12,
        });
        
        setProducts(response.products);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError("Failed to load products. Please try again.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    
    // Update URL params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all" && value !== "") {
        url.searchParams.set(key, value.toString());
      } else {
        url.searchParams.delete(key);
      }
    });
    
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-2">
          Shop All Products
        </h1>
        <p className="text-asc-charcoal">
          Discover our collection of premium athleisure wear
        </p>
      </div>

      {/* Filters */}
      <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Products */}
      <ProductGrid products={products} loading={loading} />

      {/* Pagination */}
      {pagination && !loading && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          baseUrl="/products"
        />
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
