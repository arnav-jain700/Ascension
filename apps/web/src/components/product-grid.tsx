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
  const imageUrl = product.imageUrls[0] || "/placeholder-product.jpg";
  const price = product.basePrice;
  const inStock = product.inStock;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-asc-canvas border border-asc-border rounded-lg overflow-hidden transition-all hover:border-asc-accent hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-asc-canvas/80 flex items-center justify-center">
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
          <span className="text-lg font-bold text-asc-matte">
            ₹{price.toLocaleString()}
          </span>
          
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
