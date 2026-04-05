"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { Pagination } from "@/components/pagination";
import { apiClient, ProductsResponse } from "@/lib/api";

function MenCollectionPageContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts({
          gender: "men", // Filter for men's products
          page: 1,
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
  }, []);

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
