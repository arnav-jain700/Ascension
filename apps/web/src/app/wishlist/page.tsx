import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Wishlist - Ascension",
  description: "View and manage your wishlist items",
};

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-asc-matte">
          My Wishlist
        </h1>
        <p className="text-sm text-asc-charcoal">
          0 items
        </p>
      </div>
      
      {/* Empty Wishlist */}
      <div className="rounded-lg border border-asc-border p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full border border-asc-border-strong flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-asc-charcoal"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-asc-matte mb-2">
          Your wishlist is empty
        </h2>
        
        <p className="text-asc-charcoal mb-6">
          Save items you love for later by adding them to your wishlist.
        </p>
        
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-asc-matte px-6 py-3 text-sm font-medium text-asc-canvas transition-colors hover:bg-asc-charcoal"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
