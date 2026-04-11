"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOptions } from "@/components/product-options";
import { SizeGuide } from "@/components/size-guide";
import { FitFinder } from "@/components/fit-finder";
import { ProductReviews } from "@/components/product-reviews";
import { RecommendationsSlider } from "@/components/recommendations-slider";
import { apiClient, Product, ProductVariant } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";

type Props = { params: Promise<{ slug: string }> };

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await apiClient.getProduct(slug);
        setProduct(productData);
        
        // Set first available variant as default
        const firstAvailableVariant = productData.variants.find(v => v.stockQuantity > 0);
        setSelectedVariant(firstAvailableVariant);
        
        setError(null);
      } catch (err) {
        setError("Product not found or failed to load.");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;
    
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      variant: {
        id: selectedVariant.id,
        size: selectedVariant.size,
        color: selectedVariant.color,
        sku: selectedVariant.sku,
        price: selectedVariant.price,
      },
      image: product.imageUrls[0] || "/placeholder-product.jpg",
      quantity,
    });
    
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    
    // TODO: Implement wishlist functionality
    console.log("Adding to wishlist:", product.id);
    
    alert("Wishlist functionality will be implemented in the next step!");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-asc-border rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-asc-border rounded"></div>
              <div className="h-4 bg-asc-border rounded w-3/4"></div>
              <div className="h-6 bg-asc-border rounded w-1/2"></div>
              <div className="h-20 bg-asc-border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <h1 className="text-2xl font-semibold text-asc-matte mb-4">Product Not Found</h1>
        <p className="text-asc-charcoal mb-8">{error}</p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-asc-matte px-6 py-3 text-sm font-medium text-asc-canvas transition-colors hover:bg-asc-charcoal"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;
  const maxQuantity = selectedVariant?.stockQuantity ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-asc-charcoal">
        <Link href="/" className="font-medium text-asc-accent hover:underline">
          Home
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        <Link href="/products" className="font-medium text-asc-accent hover:underline">
          Products
        </Link>
        <span className="mx-2 text-asc-border-strong">/</span>
        <span className="text-asc-matte">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <ProductGallery images={product.imageUrls} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-asc-matte mb-2">{product.name}</h1>
            <p className="text-lg text-asc-charcoal capitalize">{product.category}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-asc-matte">
              ₹{selectedVariant?.price.toLocaleString() || product.basePrice.toLocaleString()}
            </span>
            {selectedVariant && selectedVariant.price !== product.basePrice && (
              <span className="text-lg text-asc-charcoal line-through">
                ₹{product.basePrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-asc-charcoal leading-relaxed">{product.description}</p>

          {/* Product Options */}
          <ProductOptions
            variants={product.variants}
            onVariantChange={setSelectedVariant}
            selectedVariant={selectedVariant}
            siblingColors={product.siblingColors}
          />

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-asc-border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-asc-matte hover:bg-asc-accent hover:text-asc-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="px-4 py-2 text-asc-matte font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                  className="p-2 text-asc-matte hover:bg-asc-accent hover:text-asc-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-start">
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm font-medium text-asc-matte hover:text-asc-accent transition-colors underline"
                >
                  Size Guide
                </button>
                <FitFinder productName={product.name} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || !selectedVariant || addedToCart}
                className="flex-1 bg-asc-canvas border-2 border-asc-matte text-asc-matte px-6 py-3 font-medium rounded-md transition-colors hover:bg-asc-matte hover:text-asc-canvas disabled:border-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
              >
                {addedToCart ? "Added to Cart ✓" : (inStock ? "Add to Cart" : "Out of Stock")}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock || !selectedVariant}
                className="flex-1 bg-asc-matte text-asc-canvas px-6 py-3 font-medium rounded-md transition-colors hover:bg-asc-charcoal disabled:bg-asc-border disabled:text-asc-charcoal disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              
              <button
                onClick={handleAddToWishlist}
                className="p-3 border border-asc-border rounded-md text-asc-matte hover:border-asc-accent hover:text-asc-accent transition-colors"
                title="Add to Wishlist"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-asc-border pt-6">
            <h3 className="font-medium text-asc-matte mb-3">Product Details</h3>
            <ul className="space-y-2 text-sm text-asc-charcoal">
              <li>• Premium quality fabric</li>
              <li>• Comfortable fit for all-day wear</li>
              <li>• Machine washable</li>
              <li>• Designed in India</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />

      {/* Reviews Section */}
      <ProductReviews productSlug={product.slug} initialReviews={(product as any).reviews || []} />

      {/* Recommendations Slider */}
      <RecommendationsSlider productSlug={product.slug} />
    </div>
  );
}
