"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductVariant } from "@/lib/api";

interface ProductOptionsProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant) => void;
  selectedVariant?: ProductVariant;
  siblingColors?: { id: string; slug: string; sku: string; color: string; images: Record<string, unknown>[] }[];
}

export function ProductOptions({ variants, onVariantChange, selectedVariant, siblingColors }: ProductOptionsProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(selectedVariant?.size || "");
  const [selectedColor, setSelectedColor] = useState(selectedVariant?.color || "");

  // Get unique sizes and colors
  const sizes = [...new Set(variants.map(v => v.size))].sort();
  const colors = [...new Set(variants.map(v => v.color))].sort();

  // Filter variants based on current selections
  const availableVariants = variants.filter(v => 
    (!selectedSize || v.size === selectedSize) && 
    (!selectedColor || v.color === selectedColor)
  );

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Find a variant with this size and current color (or any color if none selected)
    const variant = variants.find(v => 
      v.size === size && (!selectedColor || v.color === selectedColor)
    ) || variants.find(v => v.size === size);
    
    if (variant) {
      setSelectedColor(variant.color);
      onVariantChange(variant);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Find a variant with this color and current size (or any size if none selected)
    const variant = variants.find(v => 
      v.color === color && (!selectedSize || v.size === selectedSize)
    ) || variants.find(v => v.color === color);
    
    if (variant) {
      setSelectedSize(variant.size);
      onVariantChange(variant);
    }
  };

  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <h3 className="text-sm font-medium text-asc-matte mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isAvailable = variants.some(v => v.size === size && v.stockQuantity > 0);
            const isSelected = selectedSize === size;
            
            return (
              <button
                key={size}
                onClick={() => isAvailable && handleSizeChange(size)}
                disabled={!isAvailable}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-asc-accent bg-asc-accent text-asc-canvas"
                    : isAvailable
                    ? "border-asc-border text-asc-matte hover:border-asc-accent hover:text-asc-accent"
                    : "border-asc-border text-asc-charcoal opacity-50 cursor-not-allowed"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="text-sm font-medium text-asc-matte mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isAvailable = variants.some(v => v.color === color && v.stockQuantity > 0);
            const isSelected = selectedColor === color;
            
            return (
              <button
                key={color}
                onClick={() => isAvailable && handleColorChange(color)}
                disabled={!isAvailable}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors capitalize ${
                  isSelected
                    ? "border-asc-accent bg-asc-accent text-asc-canvas"
                    : isAvailable
                    ? "border-asc-border text-asc-matte hover:border-asc-accent hover:text-asc-accent"
                    : "border-asc-border text-asc-charcoal opacity-50 cursor-not-allowed"
                }`}
              >
                {color}
              </button>
            );
          })}
          {/* Sibling Products sharing the same SKU but different colors */}
          {siblingColors?.map((sibling) => (
            <button
              key={sibling.id}
              onClick={() => router.push(`/products/${sibling.slug}`)}
              className="px-4 py-2 border rounded-md text-sm font-medium transition-colors capitalize border-asc-border text-asc-matte hover:border-asc-accent hover:text-asc-accent"
            >
              {sibling.color || "Other Color"}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      {selectedVariant && (
        <div className="flex items-center gap-2">
          {inStock ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">
                In Stock ({selectedVariant?.stockQuantity ?? 0} available)
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
