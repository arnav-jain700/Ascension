"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const safeImages = Array.isArray(images) ? images : [];

  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrev = () => {
    setSelectedImage((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square bg-asc-border rounded-lg flex items-center justify-center">
        <span className="text-asc-charcoal">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image with Slider Controls */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-asc-border group">
        <Image
          src={images[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {safeImages.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-asc-matte rounded-full shadow-md backdrop-blur-sm transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-asc-matte rounded-full shadow-md backdrop-blur-sm transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Pagination Dots (Optional mobile-friendly overlay) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
               {safeImages.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === selectedImage ? 'bg-asc-matte scale-125' : 'bg-asc-matte/30 hover:bg-asc-matte/50'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
               ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail gallery */}
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {safeImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              title={`View ${productName} image ${index + 1}`}
              aria-label={`View ${productName} image ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                selectedImage === index
                  ? "border-asc-accent"
                  : "border-asc-border hover:border-asc-accent"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
