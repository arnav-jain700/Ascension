"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/api";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-asc-border aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-asc-border rounded mb-2"></div>
            <div className="h-4 bg-asc-border rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];

  if (safeProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-asc-charcoal mb-4">
          <Image
            src="/empty-state.png"
            alt="No products"
            width={120}
            height={120}
            className="mx-auto mb-6 opacity-70"
          />
        </div>
        <h3 className="text-lg font-medium text-asc-matte mb-2">No products found</h3>
        <p className="text-asc-charcoal">Try adjusting your filters or browse all products.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const safeImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : ["/placeholder-product.jpg"];
  const [currentIdx, setCurrentIdx] = useState(0);
  const price = product.basePrice;
  const inStock = product.inStock;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % safeImages.length);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-asc-canvas border border-asc-border rounded-lg overflow-hidden transition-all hover:border-asc-accent hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden group/slider">
        <Image
          src={safeImages[currentIdx]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Sale Badge */}
        {product.comparePrice && product.comparePrice > (product.basePrice || 0) && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm shadow-md z-10">
            Sale • {Math.round(((product.comparePrice - (product.basePrice || 0)) / product.comparePrice) * 100)}% OFF
          </div>
        )}

        {/* Sliding Buttons */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-asc-matte rounded-full shadow-sm backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-asc-matte rounded-full shadow-sm backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Minimal Dots Overlay */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 opacity-0 group-hover/slider:opacity-100 transition-all duration-200">
               {safeImages.map((_, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIdx ? 'bg-asc-matte' : 'bg-asc-matte/30'}`} />
               ))}
            </div>
          </>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-asc-canvas/80 flex items-center justify-center pointer-events-none z-20">
            <span className="bg-asc-matte text-asc-canvas px-3 py-1 text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-asc-charcoal uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        
        <h3 className="font-medium text-asc-matte mb-2 group-hover:text-asc-accent transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
             {product.comparePrice && product.comparePrice > price ? (
               <>
                 <span className="text-sm text-asc-charcoal-muted line-through">₹{product.comparePrice.toLocaleString()}</span>
                 <span className="text-lg font-bold text-red-600">₹{price.toLocaleString()}</span>
               </>
             ) : (
               <span className="text-lg font-bold text-asc-matte">₹{price.toLocaleString()}</span>
             )}
          </div>
          
          {inStock && (
            <span className="text-xs text-green-600 font-medium">
              In Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
