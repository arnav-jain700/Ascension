"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const card = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  },
};

export function HomeProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        // Fetch real catalog from backend API
        const response = await fetch("/api/v1/products?limit=8&sort=createdAt&order=desc");
        if (response.ok) {
          const json = await response.json();
          // The API returns { data: { products: [...] } }
          setProducts(json.data?.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch home products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  return (
    <section className="bg-asc-canvas py-24 sm:py-32 border-t border-asc-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-asc-matte sm:text-4xl">
              New Daily Favorites
            </h2>
            <p className="mt-4 text-asc-charcoal text-lg">
              Fresh, comfortable drops for your everyday rotation.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center text-sm font-semibold text-asc-accent hover:text-asc-matte transition-colors"
          >
            Shop All Basics
            <span className="ml-2 block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {/* Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] w-full rounded-md bg-asc-sand-muted" />
                <div className="mt-4 h-4 w-3/4 rounded bg-asc-sand-muted" />
                <div className="mt-2 h-4 w-1/4 rounded bg-asc-sand-muted" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.ul
            className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 sm:gap-x-6 xl:gap-x-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {products.map((p) => (
              <motion.li key={p.id} variants={card}>
                <Link href={`/products/${p.slug}`} className="group block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-white ring-1 ring-asc-border group-hover:ring-asc-border-strong transition-all duration-300 group-hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)]">
                    {p.imageUrls && p.imageUrls.length > 0 ? (
                      <div className="h-full w-full relative">
                        <img
                          src={p.imageUrls[0]}
                          alt={p.name}
                          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {/* If there's a discount, calculate and show badge */}
                        {p.comparePrice && p.comparePrice > (p.basePrice || 0) && (
                          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm shadow-md">
                            Sale
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-asc-sand-muted">
                        <span className="text-xs font-medium uppercase tracking-wider text-asc-charcoal-muted">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* Quick Add Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full items-center justify-center bg-white/90 backdrop-blur-sm p-4 text-center transition-transform duration-300 group-hover:translate-y-0 hidden sm:flex">
                        <span className="text-sm font-medium text-asc-matte">Quick View</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 space-y-1.5 flex flex-col items-center text-center">
                    <p className="text-[10px] sm:text-xs uppercase tracking-widest text-asc-charcoal-muted font-medium">
                      {p.category || "Apparel"}
                    </p>
                    <h3 className="font-semibold text-sm sm:text-base text-asc-matte group-hover:text-asc-accent transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-2">
                       {p.comparePrice && p.comparePrice > (p.basePrice || 0) ? (
                         <>
                           <span className="text-sm text-asc-charcoal-muted line-through">₹{p.comparePrice.toLocaleString()}</span>
                           <span className="text-sm font-bold text-red-600">₹{(p.basePrice || 0).toLocaleString()}</span>
                         </>
                       ) : (
                         <span className="text-sm font-bold text-asc-charcoal">₹{(p.basePrice || 0).toLocaleString()}</span>
                       )}
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <div className="text-center py-24 bg-asc-sand-muted rounded-lg border border-asc-border border-dashed">
            <h3 className="text-lg font-medium text-asc-matte">No products found</h3>
            <p className="mt-2 text-asc-charcoal">We are currently restocking the catalog.</p>
          </div>
        )}
      </div>
    </section>
  );
}
