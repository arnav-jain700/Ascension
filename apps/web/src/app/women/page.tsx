"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { apiClient, ProductsResponse } from "@/lib/api";

function WomenCollectionPageContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWomenProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts({
          gender: "women", // Filter for women's products
          page: 1,
          limit: 12,
        });
        
        setProducts(response.products);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError("Failed to load women's products. Please try again.");
        console.error("Error fetching women's products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWomenProducts();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte mb-2">
          Women's Collection
        </h1>
        <p className="text-asc-charcoal">
          Discover our premium women's t-shirts and joggers
        </p>
      </div>

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
          baseUrl="/women"
        />
      )}
    </div>
  );
}

export default function WomenCollectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WomenCollectionPageContent />
    </Suspense>
  );
}
