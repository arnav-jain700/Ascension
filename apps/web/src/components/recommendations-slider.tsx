"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient, Product } from "@/lib/api";

export function RecommendationsSlider({ productSlug }: { productSlug: string }) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const data = await apiClient.getRecommendations(productSlug);
        setRecommendations(data || []);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    if (productSlug) {
      loadRecommendations();
    }
  }, [productSlug]);

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="mt-16 border-t border-asc-border pt-12">
      <h2 className="text-2xl font-bold text-asc-matte mb-6">Complete The Look</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recommendations.map((item) => {
          // Find first image URL
          const imageUrl = item.imageUrls?.[0] || (item as any).images?.[0]?.url || "/placeholder-product.jpg";
          
          return (
            <Link key={item.id} href={`/products/${item.slug}`} className="group relative border border-asc-border rounded-lg overflow-hidden flex flex-col hover:border-asc-accent transition-colors">
              <div className="aspect-[3/4] relative w-full bg-asc-border">
                <Image
                  src={imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex flex-col items-center">
                <h3 className="font-semibold text-asc-matte text-center">{item.name}</h3>
                <p className="font-medium text-asc-matte mt-1">
                  ₹{item.basePrice?.toLocaleString() || (item as any).price?.toLocaleString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
