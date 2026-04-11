"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { ProductFilters } from "@/components/product-filters";
import { apiClient, ProductsResponse } from "@/lib/api";

function MenCollectionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || "",
    gender: "men", // Force gender to be men for this page
    priceRange: searchParams.get("priceRange") || "all",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    sort: searchParams.get("sort") || "newest",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchMenProducts = async () => {
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
        setError("Failed to load men's products. Please try again.");
        console.error("Error fetching men's products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenProducts();
  }, [filters, currentPage]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    // Force gender to remain "men" regardless of what comes back
    const appliedFilters = { ...newFilters, gender: "men" };
    setFilters(appliedFilters);
    
    // Reset to page 1 when filters change
    const url = new URL(window.location.href);
    url.searchParams.set("page", "1");
    
    // Update URL params
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (key !== "gender" && value !== undefined && value !== null && value !== "all" && value !== "") {
        url.searchParams.set(key, value.toString());
      } else if (key !== "gender") {
        url.searchParams.delete(key);
      }
    });

    router.push(`${pathname}?${url.searchParams.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-2">
          Men's Collection
        </h1>
        <p className="text-asc-charcoal">
          Discover our premium men's t-shirts and joggers
        </p>
      </div>

      {/* Filters */}
      <ProductFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange} 
        hideGender={true} 
      />

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
          baseUrl="/men"
        />
      )}
    </div>
  );
}

export default function MenCollectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenCollectionPageContent />
    </Suspense>
  );
}
